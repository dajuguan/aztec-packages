#include "ffiterm.hpp"
#include <gtest/gtest.h>
#include <unordered_map>

namespace {
auto& engine = bb::numeric::get_debug_randomness();
}

// TODO(alex): more tests
using namespace smt_terms;

TEST(integermod, addition)
{
    bb::fr a = bb::fr::random_element();
    bb::fr b = bb::fr::random_element();
    bb::fr c = a + b;
    Solver s("30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001", { true, 0 }, 16);

    FFITerm x = FFITerm::Var("x", &s);
    FFITerm y = FFITerm::Var("y", &s);
    FFITerm bval = FFITerm(b, &s);
    FFITerm z = x + y;
    z.mod();
    
    z == c;
    x == a;
    ASSERT_TRUE(s.check());

    std::string yvals = s.s.getValue(y.term).getIntegerValue();
    std::string bvals = s.s.getValue(bval.term).getIntegerValue();
    ASSERT_EQ(bvals, yvals);
}

TEST(integermod, subtraction)
{
    bb::fr a = bb::fr::random_element();
    bb::fr b = bb::fr::random_element();
    bb::fr c = a - b;
    Solver s("30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001", { true, 0 }, 16);

    FFITerm x = FFITerm::Var("x", &s);
    FFITerm y = FFITerm::Var("y", &s);
    FFITerm bval = FFITerm(b, &s);
    FFITerm z = x - y;
    z.mod();
    
    z == c;
    x == a;
    ASSERT_TRUE(s.check());

    std::string yvals = s.s.getValue(y.term).getIntegerValue();
    std::string bvals = s.s.getValue(bval.term).getIntegerValue();
    ASSERT_EQ(bvals, yvals);
}

TEST(integermod, multiplication)
{
    bb::fr a = bb::fr::random_element();
    bb::fr b = bb::fr::random_element();
    bb::fr c = a * b;
    Solver s("30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001", { true, 0 }, 16);

    FFITerm x = FFITerm::Var("x", &s);
    FFITerm y = FFITerm::Var("y", &s);
    FFITerm bval = FFITerm(b, &s);
    FFITerm z = x * y;
    z.mod();
    
    z == c;
    x == a;
    ASSERT_TRUE(s.check());

    std::string yvals = s.s.getValue(y.term).getIntegerValue();
    std::string bvals = s.s.getValue(bval.term).getIntegerValue();
    ASSERT_EQ(bvals, yvals);
}

TEST(integermod, division)
{
    bb::fr a = bb::fr::random_element();
    bb::fr b = bb::fr::random_element();
    bb::fr c = a / b;
    Solver s("30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001", { true, 0 }, 16);

    FFITerm x = FFITerm::Var("x", &s);
    FFITerm y = FFITerm::Var("y", &s);
    FFITerm bval = FFITerm(b, &s);
    FFITerm z = x / y;
    //z.mod(); TODO(alex): something bad
    
    z == c;
    x == a;
    ASSERT_TRUE(s.check());

    std::string yvals = s.s.getValue(y.term).getIntegerValue();
    std::string bvals = s.s.getValue(bval.term).getIntegerValue();
    ASSERT_EQ(bvals, yvals);
}

// TODO(alex): test range constraint