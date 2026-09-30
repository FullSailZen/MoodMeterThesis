import cProfile
import mimetypes
import pstats
import sys
from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def run_baseline_test():
    for _ in range(100):
        response = client.get("/")
        response.raise_for_status()


def run_evidence_test(receipt_path: Path, purchase_paths: list[Path]):
    receipt_type = mimetypes.guess_type(receipt_path.name)[0] or "image/jpeg"

    with receipt_path.open("rb") as receipt_file:
        files = [
            (
                "receipt",
                (
                    receipt_path.name,
                    receipt_file,
                    receipt_type,
                ),
            )
        ]

        purchase_files = []

        try:
            for purchase_path in purchase_paths:
                purchase_type = (
                    mimetypes.guess_type(purchase_path.name)[0]
                    or "image/jpeg"
                )

                purchase_file = purchase_path.open("rb")
                purchase_files.append(purchase_file)

                files.append(
                    (
                        "purchase_images",
                        (
                            purchase_path.name,
                            purchase_file,
                            purchase_type,
                        ),
                    )
                )

            response = client.post(
                "/evidence/analyze",
                files=files,
            )

            response.raise_for_status()
            print(response.json())

        finally:
            for purchase_file in purchase_files:
                purchase_file.close()


def save_profile(profiler: cProfile.Profile, filename: str):
    with open(filename, "w") as output:
        stats = pstats.Stats(
            profiler,
            stream=output,
        )

        stats.sort_stats("cumulative")
        stats.print_stats(40)

    stats = pstats.Stats(profiler)
    stats.sort_stats("cumulative")
    stats.print_stats(40)


def main():
    print("\nRunning baseline CPU profile...\n")

    baseline_profiler = cProfile.Profile()
    baseline_profiler.enable()

    run_baseline_test()

    baseline_profiler.disable()

    save_profile(
        baseline_profiler,
        "baseline_cpu_profile.txt",
    )

    if len(sys.argv) >= 3:
        receipt_path = Path(sys.argv[1])
        purchase_paths = [
            Path(path)
            for path in sys.argv[2:]
        ]

        print("\nRunning evidence analysis CPU profile...\n")

        evidence_profiler = cProfile.Profile()
        evidence_profiler.enable()

        run_evidence_test(
            receipt_path,
            purchase_paths,
        )

        evidence_profiler.disable()

        save_profile(
            evidence_profiler,
            "evidence_cpu_profile.txt",
        )


if __name__ == "__main__":
    main()