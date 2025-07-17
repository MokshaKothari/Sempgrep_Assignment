import subprocess
import json
import sys
import os

def run_semgrep(filepath):
    rules_path = os.path.join(os.path.dirname(__file__), "semgrep_rules")

    result = subprocess.run(
        ["semgrep", "--config", rules_path, filepath, "--json"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        encoding='utf-8',  # -------------------Force UTF-8
        errors='replace'   # -------------------Replace invalid characters safely
    )

    if result.returncode != 0 and not result.stdout.strip():
        print(json.dumps({"results": []}))
        sys.exit(0)

    print(result.stdout)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"results": []}))
        sys.exit(0)

    run_semgrep(sys.argv[1])
