#!/usr/bin/env python3
"""
Traffic & Load Generator for Hate Speech Classifier API.
Sends a realistic distribution of benign, debate, and toxic texts to the /predict endpoint
to populate Prometheus metrics and Grafana observability dashboards.
"""

import argparse
import concurrent.futures
import json
import random
import sys
import time
import urllib.request
import urllib.error

# Benchmark realistic prompt corpus with diverse lengths and sentiment profiles
BENCHMARK_PROMPTS = [
    # Safe / Civil / Friendly (65%)
    ("Not-Hateful", "What a wonderful morning! I love spending time with friends and family in the park."),
    ("Not-Hateful", "I disagree with the recent economic policy changes, but I respect the committee's decision."),
    ("Not-Hateful", "The new community workshop was incredibly informative and helpful for everyone."),
    ("Not-Hateful", "Can anyone recommend a good open-source database for scalable microservices?"),
    ("Not-Hateful", "Great presentation today on Kubernetes operator patterns and Prometheus metrics."),
    ("Not-Hateful", "Let's review the pull request and discuss the architectural trade-offs during standup."),
    ("Not-Hateful", "The weather forecast predicts sunny skies throughout the upcoming weekend."),
    ("Not-Hateful", "Thank you for organizing the charity event and helping local community shelters."),
    ("Not-Hateful", "Machine learning inference latency is crucial when serving high-concurrency real-time APIs."),
    ("Not-Hateful", "I enjoy reading empirical research papers on transformer distillation and NLP benchmarks."),
    ("Not-Hateful", "Please make sure to document the Terraform infrastructure modules thoroughly."),
    ("Not-Hateful", "Our university data analytics cohort collaborated on a fascinating NLP classification project."),
    ("Not-Hateful", "The council voted unanimously to allocate additional funding for public transit improvements."),
    ("Not-Hateful", "Congratulations to the engineering team on achieving zero-downtime rolling deployments!"),

    # Hostile / Toxic / Hate Speech (35%)
    ("Hateful", "Get out of our country, people like you ruin everything and don't belong here."),
    ("Hateful", "You are subhuman filth and your entire group should be violently eradicated."),
    ("Hateful", "Nobody wants your kind around here, go back to where you came from."),
    ("Hateful", "These disgusting parasites are destroying our culture and should be removed by force."),
    ("Hateful", "Your community is inferior and subhuman, you do not deserve equal human rights."),
    ("Hateful", "I hate everything about people like you, you all deserve to suffer and be punished."),
    ("Hateful", "We need to purge our society of these toxic invaders before they destroy us completely."),
    ("Hateful", "You are a subhuman plague on our nation and should be wiped out."),
]


def send_request(url: str, text: str, timeout: float = 10.0) -> dict:
    """Send a single POST request to the inference API."""
    req = urllib.request.Request(
        url,
        data=json.dumps({"text": text}).encode("utf-8"),
        headers={"Content-Type": "application/json", "User-Agent": "TrafficGenerator/1.0"},
    )
    start_time = time.perf_counter()
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            elapsed_ms = (time.perf_counter() - start_time) * 1000.0
            data = json.loads(resp.read().decode("utf-8"))
            return {
                "success": True,
                "status": resp.status,
                "elapsed_ms": elapsed_ms,
                "label": data.get("label"),
                "hateful_score": data.get("hateful_score", 0.0),
                "not_hateful_score": data.get("not_hateful_score", 0.0),
            }
    except urllib.error.HTTPError as e:
        elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        return {"success": False, "status": e.code, "elapsed_ms": elapsed_ms, "error": str(e)}
    except Exception as e:
        elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        return {"success": False, "status": 0, "elapsed_ms": elapsed_ms, "error": str(e)}


def run_traffic_simulation(
    target_url: str,
    total_requests: int = 100,
    concurrency: int = 4,
    delay_between_batches: float = 0.05,
):
    """Execute the concurrent traffic generator."""
    if not target_url.endswith("/predict"):
        target_url = f"{target_url.rstrip('/')}/predict"

    print("=" * 70)
    print("🚀 Starting Hate Speech Classifier Traffic Generator")
    print(f"🎯 Target Endpoint: {target_url}")
    print(f"📊 Total Requests:  {total_requests}")
    print(f"⚡ Concurrency:     {concurrency} worker threads")
    print("=" * 70)

    # Check health first
    health_url = target_url.replace("/predict", "/health")
    try:
        with urllib.request.urlopen(health_url, timeout=5.0) as resp:
            print(f"✅ Backend Health Check: HTTP {resp.status} (Backend is ONLINE)")
    except Exception as e:
        print(f"⚠️ Health check warning at {health_url}: {e}")

    results = []
    start_all = time.perf_counter()

    with concurrent.futures.ThreadPoolExecutor(max_workers=concurrency) as executor:
        futures = []
        for i in range(total_requests):
            _, prompt_text = random.choice(BENCHMARK_PROMPTS)
            
            # Optionally add slight random variance to prompt length
            if random.random() < 0.2:
                prompt_text = f"{prompt_text} Additional contextual reference id-{i}."

            futures.append(executor.submit(send_request, target_url, prompt_text))

            if delay_between_batches > 0 and i % concurrency == 0:
                time.sleep(delay_between_batches)

        completed = 0
        for future in concurrent.futures.as_completed(futures):
            res = future.result()
            results.append(res)
            completed += 1
            if completed % 20 == 0 or completed == total_requests:
                print(f"  Progress: {completed}/{total_requests} requests completed ({completed/total_requests:.0%})")

    total_time = time.perf_counter() - start_all
    success_count = sum(1 for r in results if r["success"])
    fail_count = total_requests - success_count
    latencies = [r["elapsed_ms"] for r in results if r["success"]]
    hateful_count = sum(1 for r in results if r.get("label") == "Hateful")
    safe_count = sum(1 for r in results if r.get("label") == "Not-Hateful")

    avg_lat = sum(latencies) / len(latencies) if latencies else 0.0
    min_lat = min(latencies) if latencies else 0.0
    max_lat = max(latencies) if latencies else 0.0
    rps = total_requests / total_time if total_time > 0 else 0.0

    print("\n" + "=" * 70)
    print("📈 Traffic Generation Summary & Prometheus Telemetry")
    print("=" * 70)
    print(f"⏱️ Total Elapsed Time:   {total_time:.2f} seconds")
    print(f"⚡ Throughput:           {rps:.1f} req/sec")
    print(f"✅ Successful Requests:  {success_count}/{total_requests} ({success_count/total_requests:.1%})")
    print(f"❌ Failed Requests:      {fail_count}")
    print(f"📊 Classifications:     🛡️ Safe: {safe_count} | ⚠️ Hateful: {hateful_count}")
    print(f"⚡ Latency (Round-trip): Avg: {avg_lat:.1f}ms | Min: {min_lat:.1f}ms | Max: {max_lat:.1f}ms")
    print("=" * 70)
    print("🎉 Prometheus metrics and Grafana dashboards are now freshly populated!")


def main():
    parser = argparse.ArgumentParser(description="Traffic Generator for Hate Speech Classifier")
    parser.add_argument(
        "--url",
        "-u",
        default="http://localhost:8000",
        help="Base API URL (default: http://localhost:8000)",
    )
    parser.add_argument(
        "--requests",
        "-n",
        type=int,
        default=100,
        help="Number of requests to generate (default: 100)",
    )
    parser.add_argument(
        "--concurrency",
        "-c",
        type=int,
        default=4,
        help="Number of concurrent workers (default: 4)",
    )
    parser.add_argument(
        "--delay",
        "-d",
        type=float,
        default=0.02,
        help="Delay between request dispatches in seconds (default: 0.02)",
    )

    args = parser.parse_args()
    run_traffic_simulation(
        target_url=args.url,
        total_requests=args.requests,
        concurrency=args.concurrency,
        delay_between_batches=args.delay,
    )


if __name__ == "__main__":
    main()
