#!/usr/bin/env python3
"""
Evaluation script to compare RAG vs vanilla responses.
Runs questions through both modes and generates a comparison report.
"""
import argparse
import importlib.util
import re
from datetime import datetime
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

# Import query module from sibling directory
query_path = Path(__file__).parent.parent / "03_query" / "query.py"
spec = importlib.util.spec_from_file_location("query", query_path)
if spec is None or spec.loader is None:
    raise ImportError(f"Could not load query module from {query_path}")
query = importlib.util.module_from_spec(spec)
spec.loader.exec_module(query)
get_llm = query.get_llm
get_vector_store = query.get_vector_store
ask = query.ask

# Default configuration
DEFAULT_QUESTIONS_FILE = Path(__file__).parent / "questions.md"
DEFAULT_OUTPUT_FILE = Path(__file__).parent / "results.md"


def parse_questions(questions_file):
    """Parse questions from markdown file."""
    content = questions_file.read_text(encoding="utf-8")

    # Match pattern: number. **title**\n   > question
    pattern = r'\d+\.\s+\*\*(.+?)\*\*\s*\n\s*>\s*(.+?)(?=\n\n|\n\d+\.|\Z)'
    matches = re.findall(pattern, content, re.DOTALL)

    questions = []
    for title, question in matches:
        questions.append({
            "title": title.strip(),
            "question": question.strip()
        })

    return questions


def run_evaluation(question, llm, vector_store):
    """Run a single question through both vanilla and RAG modes."""
    # RAG response
    rag_response = ask(question, llm, vector_store)

    # Vanilla response
    vanilla_response = ask(question, llm, vector_store=None)

    return rag_response, vanilla_response


def truncate_response(response, max_length=500):
    """Truncate response for table display."""
    response = response.replace("\n", " ").strip()
    if len(response) > max_length:
        return response[:max_length] + "..."
    return response


def generate_analysis(questions_results, llm):
    """Generate an analysis comparing RAG vs vanilla responses."""
    analysis_prompt = """Analyze the following comparison between RAG-augmented and vanilla LLM responses for legal questions.

For each question, evaluate:
1. Which response is more accurate and complete?
2. Does RAG provide specific article references that vanilla doesn't?
3. Are there any hallucinations in either response?

Provide a concise summary of findings.

Results:
"""
    for result in questions_results:
        analysis_prompt += f"""
Question: {result['question']}

RAG Response: {result['rag_response'][:1000]}

Vanilla Response: {result['vanilla_response'][:1000]}

---
"""

    analysis_prompt += "\nProvide your analysis:"

    response = llm.invoke(analysis_prompt)
    if hasattr(response, 'content'):
        return response.content
    return response


def generate_report(questions_results, analysis, output_file):
    """Generate markdown report with results table and analysis."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    report = f"""# RAG vs Vanilla Evaluation Report

Generated: {timestamp}

## Summary

| # | Question | RAG Response | Vanilla Response |
|---|----------|--------------|------------------|
"""

    for i, result in enumerate(questions_results, 1):
        rag_short = truncate_response(result['rag_response'], 200)
        vanilla_short = truncate_response(result['vanilla_response'], 200)
        report += f"| {i} | {result['title']} | {rag_short} | {vanilla_short} |\n"

    report += "\n## Detailed Responses\n\n"

    for i, result in enumerate(questions_results, 1):
        report += f"""### {i}. {result['title']}

**Question:** {result['question']}

#### RAG Response

{result['rag_response']}

#### Vanilla Response

{result['vanilla_response']}

---

"""

    if analysis:
        report += f"""## Analysis

{analysis}
"""

    output_file.write_text(report, encoding="utf-8")
    return report


def main():
    parser = argparse.ArgumentParser(
        description="Evaluate RAG vs vanilla responses for legal questions"
    )
    parser.add_argument(
        "--questions", "-q",
        type=Path,
        default=DEFAULT_QUESTIONS_FILE,
        help=f"Questions file (default: {DEFAULT_QUESTIONS_FILE})"
    )
    parser.add_argument(
        "--output", "-o",
        type=Path,
        default=DEFAULT_OUTPUT_FILE,
        help=f"Output file (default: {DEFAULT_OUTPUT_FILE})"
    )
    parser.add_argument(
        "--provider", "-p",
        choices=["ollama", "claude"],
        default="ollama",
        help="LLM provider (default: ollama)"
    )
    parser.add_argument(
        "--model", "-m",
        help="Model name override"
    )
    parser.add_argument(
        "--url", "-u",
        default="http://192.168.1.58:8889/",
        help="Ollama server URL"
    )
    parser.add_argument(
        "--qdrant-url",
        default="http://localhost:6333",
        help="Qdrant server URL"
    )
    parser.add_argument(
        "--collection",
        default="law_library",
        help="Qdrant collection name"
    )
    parser.add_argument(
        "--no-analysis",
        action="store_true",
        help="Skip LLM analysis of results"
    )
    parser.add_argument(
        "--parallel", "-j",
        type=int,
        default=1,
        help="Number of parallel questions to process (default: 1)"
    )

    args = parser.parse_args()

    # Determine model
    if args.model:
        model = args.model
    elif args.provider == "claude":
        model = "claude-sonnet-4-20250514"
    else:
        model = "Qwen3 4B Instruct"

    print(f"Loading questions from {args.questions}...")
    questions = parse_questions(args.questions)
    print(f"Found {len(questions)} questions")

    print(f"Initializing LLM ({args.provider}: {model})...")
    llm = get_llm(args.provider, model, args.url)

    print(f"Initializing vector store ({args.qdrant_url})...")
    vector_store = get_vector_store(args.qdrant_url, args.collection)

    print("\nRunning evaluation...")
    results = []

    if args.parallel > 1:
        with ThreadPoolExecutor(max_workers=args.parallel) as executor:
            futures = {
                executor.submit(
                    run_evaluation, q["question"], llm, vector_store
                ): q for q in questions
            }
            for future in as_completed(futures):
                q = futures[future]
                try:
                    rag_resp, vanilla_resp = future.result()
                    results.append({
                        "title": q["title"],
                        "question": q["question"],
                        "rag_response": rag_resp,
                        "vanilla_response": vanilla_resp
                    })
                    print(f"  Completed: {q['title']}")
                except Exception as e:
                    print(f"  Error on '{q['title']}': {e}")
    else:
        for q in questions:
            print(f"  Processing: {q['title']}...")
            try:
                rag_resp, vanilla_resp = run_evaluation(
                    q["question"], llm, vector_store
                )
                results.append({
                    "title": q["title"],
                    "question": q["question"],
                    "rag_response": rag_resp,
                    "vanilla_response": vanilla_resp
                })
            except Exception as e:
                print(f"    Error: {e}")

    # Sort results to match original question order
    title_order = {q["title"]: i for i, q in enumerate(questions)}
    results.sort(key=lambda x: title_order.get(x["title"], 999))

    # Generate analysis
    analysis = None
    if not args.no_analysis and results:
        print("\nGenerating analysis...")
        try:
            analysis = generate_analysis(results, llm)
        except Exception as e:
            print(f"  Analysis failed: {e}")
            analysis = f"Analysis generation failed: {e}"

    # Generate report
    print(f"\nGenerating report to {args.output}...")
    generate_report(results, analysis, args.output)

    print(f"\nDone! Results saved to {args.output}")


if __name__ == "__main__":
    main()
