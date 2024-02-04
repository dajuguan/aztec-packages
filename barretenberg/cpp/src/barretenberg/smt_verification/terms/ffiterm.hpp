#pragma once
#include "barretenberg/smt_verification/solver/solver.hpp"

namespace smt_terms {
using namespace smt_solver;

/**
 * @brief Integer Modulo element class.
 *
 * @details Can be a symbolic variable or a constant.
 * Both of them support basic arithmetic operations: +, -, *, /.
 * Check the satisfability of a system and get it's model.
 *
 * @todo TODO(alex): Have to patch cvc5 to create integers from hex...
 * @todo TODO(alex): Add <=, xor operators
 */
class FFITerm {
  public:
    Solver* solver;
    cvc5::Term term;
    cvc5::Term modulus;

    FFITerm()
        : solver(nullptr)
        , term(cvc5::Term())
        , modulus(cvc5::Term()){};

    explicit FFITerm(const std::string& t, Solver* slv, bool isconst = false, uint32_t base = 16);
    FFITerm(cvc5::Term& term, Solver* s)
        : solver(s)
        , term(term)
        , modulus(s->s.mkInteger(s->modulus))
    {}

    FFITerm(const FFITerm& other) = default;
    FFITerm(FFITerm&& other) = default;

    static FFITerm Var(const std::string& name, Solver* slv);
    static FFITerm Const(const std::string& val, Solver* slv, uint32_t base = 16);

    FFITerm(bb::fr value, Solver* s){
        std::stringstream buf; // TODO(alex): looks bad. Would be great to create tostring() converter
        buf << value;
        std::string tmp = buf.str();
        tmp[1] = '0';          // avoiding `x` in 0x prefix
        
        *this = Const(tmp, s);
    }

    void mod();

    FFITerm& operator=(const FFITerm& right) = default;
    FFITerm& operator=(FFITerm&& right) = default;

    FFITerm operator+(const FFITerm& other) const;
    void operator+=(const FFITerm& other);
    FFITerm operator-(const FFITerm& other) const;
    void operator-=(const FFITerm& other);
    FFITerm operator-() const;
    
    FFITerm operator*(const FFITerm& other) const;
    void operator*=(const FFITerm& other);
    FFITerm operator/(const FFITerm& other) const;
    void operator/=(const FFITerm& other);

    void operator==(const FFITerm& other) const;
    void operator!=(const FFITerm& other) const;

    FFITerm operator^(const FFITerm& other) const;
    void operator^=(const FFITerm& other);

    FFITerm& operator=(const bb::fr& right){
        *this = FFITerm(right, this->solver);
        return *this;
    }
    FFITerm& operator=(bb::fr&& right){
        *this = FFITerm(right, this->solver);
        return *this;
    }

    FFITerm operator+(const bb::fr& other) const{
        return *this + FFITerm(other, this->solver);
    }
    void operator+=(const bb::fr& other){
        *this += FFITerm(other, this->solver);
    }
    FFITerm operator-(const bb::fr& other) const{
        return *this - FFITerm(other, this->solver);
    }
    void operator-=(const bb::fr& other){
        *this -= FFITerm(other, this->solver);
    }
    FFITerm operator*(const bb::fr& other) const{
        return *this * FFITerm(other, this->solver);
    }
    void operator*=(const bb::fr& other){
        *this *= FFITerm(other, this->solver);
    }
    FFITerm operator/(const bb::fr& other) const{
        return *this / FFITerm(other, this->solver);
    }
    void operator/=(const bb::fr& other){
        *this /= FFITerm(other, this->solver);
    }

    void operator==(const bb::fr& other) const{
        *this == FFITerm(other, this->solver);
    }
    void operator!=(const bb::fr& other) const{
        *this != FFITerm(other, this->solver);
    }
    FFITerm operator^(const bb::fr& other) const{
        return *this ^ FFITerm(other, this->solver);
    }
    void operator^=(const bb::fr& other){
        *this ^= FFITerm(other, this->solver);
    }
    void operator<(const bb::fr& other) const;
    void operator<=(const bb::fr& other) const;
    void operator>(const bb::fr& other) const;
    void operator>=(const bb::fr& other) const;

    operator std::string() const
    {
        return term.isIntegerValue() ? term.getIntegerValue() : term.toString();
    };
    
    operator cvc5::Term() const { return term; };

    ~FFITerm() = default;
    friend std::ostream& operator<<(std::ostream& out, const FFITerm& k) { return out << k.term; }

    friend FFITerm batch_add(const std::vector<FFITerm>& children)
    {
        Solver* slv = children[0].solver;
        std::vector<cvc5::Term> terms(children.begin(), children.end());
        cvc5::Term res = slv->s.mkTerm(cvc5::Kind::ADD, terms);
        res = slv->s.mkTerm(cvc5::Kind::INTS_MODULUS, { res, children[0].modulus });
        return { res, slv };
    }

    friend FFITerm batch_mul(const std::vector<FFITerm>& children)
    {
        Solver* slv = children[0].solver;
        std::vector<cvc5::Term> terms(children.begin(), children.end());
        cvc5::Term res = slv->s.mkTerm(cvc5::Kind::MULT, terms);
        res = slv->s.mkTerm(cvc5::Kind::INTS_MODULUS, { res, children[0].modulus });
        return { res, slv };
    }
};

FFITerm operator+(const bb::fr& lhs, const FFITerm& rhs);
FFITerm operator-(const bb::fr& lhs, const FFITerm& rhs);
FFITerm operator*(const bb::fr& lhs, const FFITerm& rhs);
FFITerm operator^(const bb::fr& lhs, const FFITerm& rhs);
FFITerm operator/(const bb::fr& lhs, const FFITerm& rhs);
void operator==(const bb::fr& lhs, const FFITerm& rhs);
void operator!=(const bb::fr& lhs, const FFITerm& rhs);

} // namespace smt_terms
