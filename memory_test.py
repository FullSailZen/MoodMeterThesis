import gc
import time
import tracemalloc
import urllib.request


BASE_URL = "http://127.0.0.1:8000"


TEST_ENDPOINTS = [
    "/api/v1/businesses?q=Walmart",
    "/api/v1/businesses/2/moodscore",
    "/users/4/profile",
    "/users/6/profile",
    "/reviews/32/details"
]


def format_bytes(byte_count):
    return (
        byte_count
        / 1024
        / 1024
    )


def make_request(endpoint):
    url = (
        f"{BASE_URL}{endpoint}"
    )

    start_time = (
        time.perf_counter()
    )

    with urllib.request.urlopen(
        url,
        timeout=30
    ) as response:
        body = response.read()

        status = response.status

    elapsed = (
        time.perf_counter()
        - start_time
    )

    return {
        "endpoint":
            endpoint,

        "status":
            status,

        "bytes":
            len(body),

        "seconds":
            elapsed
    }


def print_memory(label):
    current, peak = (
        tracemalloc.get_traced_memory()
    )

    print(
        f"\n{label}"
    )

    print(
        f"Current memory: "
        f"{format_bytes(current):.3f} MB"
    )

    print(
        f"Peak memory:    "
        f"{format_bytes(peak):.3f} MB"
    )

    return (
        current,
        peak
    )


def main():
    print(
        "MoodMeter Memory Performance Test"
    )

    print(
        "=" * 50
    )

    print(
        "\nEndpoints:"
    )

    for endpoint in TEST_ENDPOINTS:
        print(
            f"  {endpoint}"
        )


    gc.collect()

    tracemalloc.start(
        25
    )


    baseline_snapshot = (
        tracemalloc.take_snapshot()
    )

    baseline_current, _ = (
        print_memory(
            "Baseline"
        )
    )


    results = []


    print(
        "\nRunning MoodMeter requests..."
    )

    print(
        "=" * 50
    )


    for endpoint in TEST_ENDPOINTS:
        result = (
            make_request(
                endpoint
            )
        )

        results.append(
            result
        )

        print(
            f"\n{endpoint}"
        )

        print(
            f"Status: "
            f"{result['status']}"
        )

        print(
            f"Response size: "
            f"{result['bytes']} bytes"
        )

        print(
            f"Time: "
            f"{result['seconds']:.4f} s"
        )


    workload_snapshot = (
        tracemalloc.take_snapshot()
    )

    workload_current, workload_peak = (
        print_memory(
            "After Requests"
        )
    )


    print(
        "\nRunning garbage collection..."
    )

    gc.collect()


    final_snapshot = (
        tracemalloc.take_snapshot()
    )

    final_current, _ = (
        print_memory(
            "After Garbage Collection"
        )
    )


    memory_growth = (
        final_current
        - baseline_current
    )


    average_time = (
        sum(
            result["seconds"]
            for result
            in results
        )
        /
        len(results)
    )


    slowest = max(
        results,
        key=lambda result:
            result["seconds"]
    )


    print(
        "\nMemory Summary"
    )

    print(
        "=" * 50
    )

    print(
        f"Baseline memory: "
        f"{format_bytes(baseline_current):.3f} MB"
    )

    print(
        f"Memory after requests: "
        f"{format_bytes(workload_current):.3f} MB"
    )

    print(
        f"Memory after GC: "
        f"{format_bytes(final_current):.3f} MB"
    )

    print(
        f"Peak memory: "
        f"{format_bytes(workload_peak):.3f} MB"
    )

    print(
        f"Net memory increase: "
        f"{format_bytes(memory_growth):.3f} MB"
    )


    print(
        f"\nSuccessful requests: "
        f"{len(results)}"
    )

    print(
        f"Failed requests: 0"
    )

    print(
        f"Average request time: "
        f"{average_time:.4f} s"
    )

    print(
        f"Slowest endpoint: "
        f"{slowest['endpoint']}"
    )

    print(
        f"Slowest request time: "
        f"{slowest['seconds']:.4f} s"
    )


    print(
        "\nTop Memory Allocations"
    )

    print(
        "=" * 50
    )


    statistics = (
        workload_snapshot.statistics(
            "lineno"
        )
    )


    for index, statistic in enumerate(
        statistics[:10],
        start=1
    ):
        print(
            f"{index}. "
            f"{statistic}"
        )


    print(
        "\nLargest Memory Changes"
    )

    print(
        "=" * 50
    )


    comparison = (
        final_snapshot.compare_to(
            baseline_snapshot,
            "lineno"
        )
    )


    for index, statistic in enumerate(
        comparison[:10],
        start=1
    ):
        print(
            f"{index}. "
            f"{statistic}"
        )


    print(
        "\nTest complete."
    )


    tracemalloc.stop()


if __name__ == "__main__":
    main()