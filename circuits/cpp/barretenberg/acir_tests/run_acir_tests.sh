#!/bin/bash
# Env var overrides:
#   BB: to specify a different binary to test with (e.g. bb.js or bb.js-dev).
#   VERBOSE: to enable logging for each test.

set -e

BB=$PWD/${BB:-../cpp/build/bin/bb}
CRS_PATH=~/.bb-crs
BRANCH=mv/refresh-artifacts

# Pull down the test vectors from the noir repo, if we don't have the folder already.
if [ ! -d acir_tests ]; then
  if [ -n "$TEST_SRC" ]; then
    cp -R $TEST_SRC acir_tests
  else
    rm -rf noir
    git clone -b $BRANCH --filter=blob:none --no-checkout https://github.com/noir-lang/noir.git
    cd noir
    git sparse-checkout init --cone
    git sparse-checkout set crates/nargo_cli/tests/test_data
    git checkout
    cd ..
    mv noir/crates/nargo_cli/tests/test_data acir_tests
    rm -rf noir
  fi
fi

cd acir_tests

# Parse exclude and fail directories from cargo.toml
exclude_dirs=$(grep "^exclude" config.toml | sed 's/exclude = \[//;s/\]//;s/\"//g;s/ //g' | tr ',' '\n')
fail_dirs=$(grep "^fail" config.toml | sed 's/fail = \[//;s/\]//;s/\"//g;s/ //g' | tr ',' '\n')

# Convert them to array
exclude_array=($exclude_dirs)
fail_array=($fail_dirs)
skip_array=(diamond_deps_0 workspace workspace_default_member)

function test() {
  echo -n "Testing $1... "

  dir_name=$(basename "$1")
  if [[ " ${exclude_array[@]} " =~ " $dir_name " ]]; then
    echo -e "\033[33mSKIPPED\033[0m (excluded)"
    return
  fi

  if [[ " ${fail_array[@]} " =~ " $dir_name " ]]; then
    echo -e "\033[33mSKIPPED\033[0m (would fail)"
    return
  fi

  if [[ " ${skip_array[@]} " =~ " $dir_name " ]]; then
    echo -e "\033[33mSKIPPED\033[0m (hardcoded to skip)"
    return
  fi

  if [[ ! -f ./$1/target/$dir_name.json || ! -f ./$1/target/witness.tr ]]; then
    echo -e "\033[33mSKIPPED\033[0m (uncompiled)"
    return
  fi

  cd $1

  set +e
  if [ -n "$VERBOSE" ]; then
    echo "message content" >&2
    $BB prove_and_verify -v -c $CRS_PATH -j ./target/$dir_name.json
  else
    echo "message content" >&2
    $BB prove_and_verify -c $CRS_PATH -j ./target/$dir_name.json > /dev/null 2>&1
  fi
  result=$?
  set -e

  if [ $result -eq 0 ]; then
    echo -e "\033[32mPASSED\033[0m"
  else
    echo -e "\033[31mFAILED\033[0m"
    # Run again verbose.
    $BB prove_and_verify -v -c $CRS_PATH
    exit 1
  fi

  cd ..
}

if [ -n "$1" ]; then
  test $1
else
  for DIR in $(find -maxdepth 1 -type d -not -path '.'); do
    test $DIR
  done
fi
