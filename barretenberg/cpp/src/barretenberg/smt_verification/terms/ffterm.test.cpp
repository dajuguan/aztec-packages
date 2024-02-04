#include "ffterm.hpp"
#include <gtest/gtest.h>
#include <unordered_map>

namespace {
auto& engine = bb::numeric::get_debug_randomness();
}

// TODO(alex): more tests
using namespace smt_terms;

TEST(finitefield, addition)
{
    bb::fr a = bb::fr::random_element();
    bb::fr b = bb::fr::random_element();
    bb::fr c = a + b;
    Solver s("30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001", { true, 0 }, 16);

    FFTerm x = FFTerm::Var("x", &s);
    FFTerm y = FFTerm::Var("y", &s);
    FFTerm bval = FFTerm(b, &s);
    FFTerm z = x + y;
    z.mod();
    
    z == c;
    x == a;
    ASSERT_TRUE(s.check());

    std::string yvals = s.s.getValue(y.term).getFiniteFieldValue();
    std::string bvals = s.s.getValue(bval.term).getFiniteFieldValue();
    ASSERT_EQ(bvals, yvals);
}

TEST(finitefield, subtraction)
{
    bb::fr a = bb::fr::random_element();
    bb::fr b = bb::fr::random_element();
    bb::fr c = a - b;
    Solver s("30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001", { true, 0 }, 16);

    FFTerm x = FFTerm::Var("x", &s);
    FFTerm y = FFTerm::Var("y", &s);
    FFTerm bval = FFTerm(b, &s);
    FFTerm z = x - y;
    z.mod();
    
    z == c;
    x == a;
    ASSERT_TRUE(s.check());

    std::string yvals = s.s.getValue(y.term).getFiniteFieldValue();
    std::string bvals = s.s.getValue(bval.term).getFiniteFieldValue();
    ASSERT_EQ(bvals, yvals);
}

TEST(finitefield, multiplication)
{
    bb::fr a = bb::fr::random_element();
    bb::fr b = bb::fr::random_element();
    bb::fr c = a * b;
    Solver s("30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001", { true, 0 }, 16);

    FFTerm x = FFTerm::Var("x", &s);
    FFTerm y = FFTerm::Var("y", &s);
    FFTerm bval = FFTerm(b, &s);
    FFTerm z = x * y;
    z.mod();
    
    z == c;
    x == a;
    ASSERT_TRUE(s.check());

    std::string yvals = s.s.getValue(y.term).getFiniteFieldValue();
    std::string bvals = s.s.getValue(bval.term).getFiniteFieldValue();
    ASSERT_EQ(bvals, yvals);
}

TEST(finitefield, division)
{
    bb::fr a = bb::fr::random_element();
    bb::fr b = bb::fr::random_element();
    bb::fr c = a / b;
    Solver s("30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001", { true, 0 }, 16);

    FFTerm x = FFTerm::Var("x", &s);
    FFTerm y = FFTerm::Var("y", &s);
    FFTerm bval = FFTerm(b, &s);
    FFTerm z = x / y;
    z.mod();
    
    z == c;
    x == a;
    for(auto term: s.s.getAssertions()){
        info(term);
    }
    ASSERT_TRUE(s.check());

    std::string yvals = s.s.getValue(y.term).getFiniteFieldValue();
    std::string bvals = s.s.getValue(bval.term).getFiniteFieldValue();
    info(yvals);
    info(bvals);
    ASSERT_EQ(bvals, yvals);
}