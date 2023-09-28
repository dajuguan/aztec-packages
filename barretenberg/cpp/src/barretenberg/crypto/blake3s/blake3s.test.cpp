#include "blake3s.hpp"

#include <gtest/gtest.h>

#include "barretenberg/common/constexpr_utils.hpp"
#include <array>
#include <iostream>
#include <memory>
#include <vector>

struct test_vector {
    std::string_view input;
    std::array<uint8_t, 32> output;
};

template <size_t S> constexpr std::array<uint8_t, S> convert(const std::string_view& in)
{
    std::array<uint8_t, S> output;
    for (size_t i = 0; i < S; ++i) {
        output[i] = static_cast<unsigned char>(in[i]);
    }
    return output;
}

static constexpr std::array<test_vector, 73> test_vectors{
    test_vector{ .input = "",
      .output = {
          0xAF, 0x13, 0x49, 0xB9, 0xF5, 0xF9, 0xA1, 0xA6, 0xA0, 0x40, 0x4D, 0xEA, 0x36, 0xDC, 0xC9, 0x49,
          0x9B, 0xCB, 0x25, 0xC9, 0xAD, 0xC1, 0x12, 0xB7, 0xCC, 0x9A, 0x93, 0xCA, 0xE4, 0x1F, 0x32, 0x62,
      } },
    test_vector{ .input = "a",
      .output = {
          0x17, 0x76, 0x2F, 0xDD, 0xD9, 0x69, 0xA4, 0x53, 0x92, 0x5D, 0x65, 0x71, 0x7A, 0xC3, 0xEE, 0xA2,
          0x13, 0x20, 0xB6, 0x6B, 0x54, 0x34, 0x2F, 0xDE, 0x15, 0x12, 0x8D, 0x6C, 0xAF, 0x21, 0x21, 0x5F,
      } },
    test_vector{ .input = "ab",
      .output = {
          0x2D, 0xC9, 0x99, 0x99, 0xA6, 0xAA, 0xEF, 0x3F, 0x20, 0x34, 0x9D, 0x2E, 0xD4, 0x05, 0x7A, 0x2B,
          0x54, 0x41, 0x95, 0x45, 0xDA, 0xBB, 0x80, 0x9E, 0x63, 0x81, 0xDE, 0x1B, 0xAD, 0x83, 0x37, 0xE2,
      } },
    test_vector{ .input = "abc",
      .output = {
          0x64, 0x37, 0xB3, 0xAC, 0x38, 0x46, 0x51, 0x33, 0xFF, 0xB6, 0x3B, 0x75, 0x27, 0x3A, 0x8D, 0xB5,
          0x48, 0xC5, 0x58, 0x46, 0x5D, 0x79, 0xDB, 0x03, 0xFD, 0x35, 0x9C, 0x6C, 0xD5, 0xBD, 0x9D, 0x85,
      } },
    test_vector{ .input = "abcd",
      .output = {
          0x8C, 0x9C, 0x98, 0x81, 0x80, 0x5D, 0x1A, 0x84, 0x71, 0x02, 0xD7, 0xA4, 0x2E, 0x58, 0xB9, 0x90,
          0xD0, 0x88, 0xDD, 0x88, 0xA8, 0x4F, 0x73, 0x14, 0xD7, 0x1C, 0x83, 0x81, 0x07, 0x57, 0x1F, 0x2B,
      } },
    test_vector{ .input = "abcde",
      .output = {
          0x06, 0x48, 0xC0, 0x3B, 0x5A, 0xD9, 0xBB, 0x6D, 0xDF, 0x83, 0x06, 0xEE, 0xF6, 0xA3, 0x3E, 0xBA,
          0xE8, 0xF8, 0x9C, 0xB4, 0x74, 0x11, 0x50, 0xC1, 0xAE, 0x9C, 0xD6, 0x62, 0xFD, 0xCC, 0x1E, 0xE2,
      } },
    test_vector{ .input = "abcdef",
      .output = {
          0xB3, 0x4B, 0x56, 0x07, 0x67, 0x12, 0xFD, 0x7F, 0xB9, 0xC0, 0x67, 0x24, 0x5A, 0x6C, 0x85, 0xE1,
          0x61, 0x74, 0xB3, 0xEF, 0x2E, 0x35, 0xDF, 0x7B, 0x56, 0xB7, 0xF1, 0x64, 0xE5, 0xC3, 0x64, 0x46,
      } },
    test_vector{ .input = "abcdefg",
      .output = {
          0xE2, 0xD1, 0x8D, 0x70, 0xDB, 0x12, 0x70, 0x5E, 0x18, 0x45, 0xFA, 0xF5, 0x00, 0xDE, 0x11, 0x98,
          0xA5, 0xBA, 0x14, 0x83, 0x72, 0x9D, 0x97, 0x93, 0x6F, 0x1D, 0x2B, 0x76, 0x09, 0x68, 0x31, 0x2E,
      } },
    test_vector{ .input = "abcdefgh",
      .output = {
          0xDD, 0xAA, 0x2A, 0xC3, 0x0A, 0x98, 0x65, 0x59, 0x62, 0x97, 0x90, 0x19, 0xE4, 0x35, 0x38, 0x32,
          0x6A, 0xD7, 0xBE, 0xF0, 0xDA, 0x0E, 0x6A, 0xC2, 0xF3, 0xE5, 0x1F, 0xB3, 0x51, 0x3A, 0x5C, 0xDA,
      } },
    test_vector{ .input = "abcdefghi",
      .output = {
          0x89, 0x9E, 0xAD, 0x67, 0x56, 0x1E, 0x6E, 0x71, 0x76, 0xDD, 0xCA, 0xD0, 0xB4, 0x47, 0xCA, 0xEC,
          0x42, 0xA6, 0x58, 0xB7, 0x0B, 0xB1, 0x81, 0x75, 0x7F, 0x14, 0x4C, 0xE9, 0xEB, 0xB1, 0x59, 0xC4,
      } },
    test_vector{ .input = "abcdefghij",
      .output = {
          0xD1, 0x0C, 0x2A, 0xCB, 0x51, 0x8F, 0xD7, 0x4A, 0xE1, 0x30, 0xF6, 0x3E, 0x3A, 0x45, 0x2A, 0x9A,
          0x05, 0x54, 0x71, 0x16, 0x41, 0x81, 0xA6, 0x3A, 0x7D, 0x94, 0xC1, 0x82, 0xF5, 0x70, 0x34, 0x9B,
      } },
    test_vector{ .input = "abcdefghijk",
      .output = {
          0x33, 0x69, 0x93, 0xBC, 0xB0, 0xAA, 0xCB, 0x8B, 0x33, 0xCB, 0xBF, 0x67, 0x70, 0x25, 0x59, 0x29,
          0x62, 0x60, 0x6A, 0x69, 0x0C, 0xEC, 0xBE, 0xD3, 0x85, 0x7C, 0x81, 0xF9, 0x49, 0x36, 0x4E, 0xA5,
      } },
    test_vector{ .input = "abcdefghijkl",
      .output = {
          0xA7, 0x4A, 0x54, 0x2E, 0xA1, 0xF9, 0x95, 0x7F, 0x55, 0xBA, 0xE1, 0x99, 0xF8, 0x9A, 0xB4, 0x6B,
          0x90, 0xC8, 0xB4, 0x1E, 0x94, 0x04, 0x89, 0x07, 0x5E, 0xC9, 0x24, 0x49, 0x0F, 0xB6, 0xA9, 0x26,
      } },
    test_vector{ .input = "abcdefghijklm",
      .output = {
          0xA1, 0xF7, 0xDF, 0x9D, 0x3A, 0x01, 0x44, 0x25, 0x22, 0x0D, 0x2B, 0x96, 0xDF, 0xB3, 0xCE, 0xBA,
          0x8A, 0xD1, 0x26, 0x4E, 0xD1, 0x65, 0x56, 0x50, 0x02, 0xA6, 0xEC, 0xC3, 0x02, 0xAF, 0x7A, 0xD0,
      } },
    test_vector{ .input = "abcdefghijklmn",
      .output = {
          0x7A, 0x97, 0x9F, 0xCC, 0xF3, 0x89, 0x89, 0xFC, 0xDD, 0x63, 0x09, 0xDB, 0x94, 0x7D, 0x28, 0x6D,
          0xF2, 0xF4, 0xF7, 0xEC, 0x80, 0xDD, 0x11, 0x88, 0xEC, 0x07, 0x94, 0xE9, 0x1B, 0x8F, 0xBE, 0x2E,
      } },
    test_vector{ .input = "abcdefghijklmno",
      .output = {
          0xF3, 0x50, 0x1B, 0x61, 0x52, 0x06, 0xCE, 0x9E, 0x7D, 0xC2, 0xC6, 0xAD, 0x16, 0xA0, 0xF2, 0xC6,
          0x44, 0x34, 0xDD, 0xF1, 0xA5, 0x33, 0xBB, 0xDC, 0x0A, 0x25, 0xA6, 0x0D, 0x20, 0xE4, 0x4E, 0x5E,
      } },
    test_vector{ .input = "abcdefghijklmnop",
      .output = {
          0x00, 0x9E, 0x43, 0x83, 0x6D, 0x52, 0xF4, 0x8B, 0x87, 0x6D, 0x62, 0x74, 0xFF, 0x17, 0xFA, 0xF3,
          0xB5, 0xA3, 0x4A, 0xF7, 0x7E, 0x68, 0xD7, 0xFA, 0x73, 0x0E, 0x5E, 0xF9, 0xFE, 0xA2, 0xD3, 0x58,
      } },
    test_vector{ .input = "abcdefghijklmnopq",
      .output = {
          0x26, 0xDC, 0x2E, 0x71, 0x55, 0x16, 0xD4, 0x06, 0xC3, 0x70, 0x02, 0x05, 0x68, 0x90, 0xFE, 0xD1,
          0x94, 0x64, 0x83, 0x38, 0x7E, 0xFB, 0xB8, 0x0E, 0x87, 0x33, 0x74, 0x32, 0x67, 0x37, 0x21, 0x61,
      } },
    test_vector{ .input = "abcdefghijklmnopqr",
      .output = {
          0xD1, 0x32, 0x17, 0xD1, 0x80, 0xF3, 0x75, 0xED, 0xDD, 0x8A, 0x18, 0x9E, 0x03, 0x18, 0x31, 0x69,
          0x1F, 0xBD, 0x73, 0xB0, 0x28, 0xEE, 0x49, 0x7A, 0x5C, 0xAF, 0xC0, 0x8B, 0xD2, 0x9C, 0xEA, 0x6C,
      } },
    test_vector{ .input = "abcdefghijklmnopqrs",
      .output = {
          0x24, 0x5F, 0xE8, 0x6C, 0xDE, 0x9B, 0x1E, 0x6F, 0xAD, 0xDB, 0xFA, 0xEE, 0xAF, 0x7F, 0x9C, 0x7C,
          0xD9, 0xC0, 0x9A, 0xD6, 0x2B, 0x38, 0x45, 0x2D, 0x10, 0x3F, 0x62, 0x09, 0x83, 0x4C, 0xBF, 0x23,
      } },
    test_vector{ .input = "abcdefghijklmnopqrst",
      .output = {
          0x18, 0xC5, 0x4F, 0xED, 0x84, 0xD3, 0x23, 0xE2, 0xEE, 0x91, 0x94, 0x81, 0x19, 0x22, 0x4F, 0x31,
          0x59, 0xBF, 0xD4, 0xCD, 0xD3, 0xF5, 0x85, 0xF8, 0x2B, 0x56, 0xE0, 0xA6, 0x30, 0x92, 0xAD, 0xDE,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstu",
      .output = {
          0x61, 0x4A, 0x68, 0x5B, 0xE9, 0x1B, 0xC4, 0x46, 0x05, 0xEA, 0xE3, 0x31, 0x17, 0x5F, 0x45, 0xB8,
          0xDA, 0xC2, 0x6F, 0xE3, 0xD1, 0xC5, 0xFB, 0xCD, 0x5D, 0x76, 0x1E, 0x0F, 0x74, 0x12, 0xB8, 0x2F,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuv",
      .output = {
          0x22, 0x37, 0x6F, 0x74, 0xFE, 0x12, 0x93, 0xC4, 0xB7, 0x3B, 0xA3, 0x53, 0x7F, 0x00, 0xA3, 0x52,
          0xE6, 0xA1, 0x2D, 0x67, 0xBF, 0xF9, 0x74, 0xC3, 0xBB, 0xA4, 0x4A, 0x5F, 0xC0, 0x3F, 0xED, 0xE7,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvw",
      .output = {
          0xC9, 0x65, 0xC1, 0xCC, 0xCE, 0x9C, 0xBC, 0xCB, 0xB8, 0x68, 0x31, 0x64, 0x91, 0xAA, 0x01, 0x86,
          0xAB, 0x83, 0x9C, 0xFE, 0x86, 0xEF, 0xA4, 0xFE, 0xDF, 0xF0, 0x79, 0x2C, 0x79, 0xCF, 0x4E, 0xF9,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwx",
      .output = {
          0x3A, 0x00, 0x36, 0x42, 0xAB, 0x93, 0xEA, 0xD3, 0xDC, 0xEB, 0xDE, 0x1C, 0xD7, 0x4D, 0x48, 0x2A,
          0xEA, 0xB7, 0x6C, 0x51, 0x52, 0xA7, 0xF2, 0xE4, 0x02, 0x39, 0x63, 0xBF, 0x36, 0x57, 0x03, 0xD8,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxy",
      .output = {
          0xF7, 0xD9, 0x71, 0xE0, 0x5B, 0xAF, 0xD5, 0x8A, 0x22, 0x0F, 0x3A, 0x95, 0x34, 0x54, 0x2F, 0xE5,
          0x45, 0x60, 0x4A, 0x7F, 0x99, 0x16, 0x56, 0x49, 0xB6, 0x59, 0x09, 0x3A, 0xEB, 0xA5, 0xFA, 0x6A,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz",
      .output = {
          0x24, 0x68, 0xEE, 0xC8, 0x89, 0x4A, 0xCF, 0xB4, 0xE4, 0xDF, 0x3A, 0x51, 0xEA, 0x91, 0x6B, 0xA1,
          0x15, 0xD4, 0x82, 0x68, 0x28, 0x77, 0x54, 0x29, 0x0A, 0xAE, 0x8E, 0x9E, 0x62, 0x28, 0xE8, 0x5F,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0",
      .output = {
          0xD6, 0xC9, 0xDE, 0x2C, 0x54, 0xD2, 0x7B, 0xDB, 0x4F, 0x68, 0xCD, 0x3C, 0x73, 0x42, 0x1D, 0x81,
          0xF5, 0x2C, 0xC8, 0x06, 0xD2, 0x55, 0xDA, 0x08, 0xE2, 0x25, 0x4A, 0x0D, 0x57, 0x03, 0x1F, 0xF0,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz01",
      .output = {
          0x4D, 0x0C, 0x6F, 0x2F, 0xB0, 0xC1, 0xEB, 0xC4, 0x1B, 0xF2, 0x3C, 0xBA, 0xED, 0x30, 0x88, 0x39,
          0xD7, 0x80, 0xAB, 0x47, 0xC8, 0xA3, 0x81, 0x23, 0xAF, 0x46, 0xB6, 0xE3, 0xAD, 0x82, 0x5F, 0xA4,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz012",
      .output = {
          0x4C, 0xEB, 0x7C, 0x49, 0x7A, 0xF4, 0xB6, 0x73, 0xC8, 0x58, 0xD8, 0x74, 0x6F, 0xDD, 0xBA, 0x3B,
          0xFA, 0x80, 0xFA, 0x1A, 0xCB, 0x84, 0xE2, 0xAE, 0x91, 0x76, 0x9D, 0x4B, 0xD8, 0x74, 0xEA, 0x70,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123",
      .output = {
          0xED, 0x4C, 0x4A, 0xC9, 0x6A, 0x2E, 0xB3, 0xC0, 0xCC, 0x80, 0x88, 0xB4, 0x30, 0x3F, 0xD6, 0x78,
          0x9B, 0x65, 0x16, 0x2F, 0x35, 0xD2, 0x77, 0xB2, 0xE6, 0xA8, 0x0F, 0xAF, 0x48, 0xCA, 0x67, 0x5E,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz01234",
      .output = {
          0x6A, 0x96, 0x16, 0x1F, 0x64, 0xDB, 0x0D, 0x56, 0xF0, 0x73, 0xFF, 0xE3, 0xC2, 0xC6, 0x66, 0xEB,
          0x70, 0x2F, 0xFF, 0xCA, 0xA1, 0xF0, 0x96, 0xEB, 0xB1, 0x97, 0x0F, 0x78, 0xFD, 0xB5, 0x2B, 0xC9,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz012345",
      .output = {
          0x35, 0x5E, 0x5F, 0xD6, 0x25, 0xA9, 0xCD, 0x5C, 0x27, 0xB3, 0x12, 0xB3, 0xC4, 0x20, 0x8D, 0x02,
          0x36, 0xED, 0x6D, 0x32, 0x56, 0x6B, 0xD5, 0xA0, 0x64, 0x25, 0x99, 0xC1, 0xC8, 0x99, 0x64, 0x06,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456",
      .output = {
          0x86, 0xDE, 0x08, 0xB3, 0x23, 0x46, 0xA1, 0x21, 0xDB, 0xC1, 0xBB, 0xB9, 0x0C, 0xFF, 0xCA, 0x94,
          0x29, 0xA5, 0x06, 0x8D, 0x79, 0x52, 0xFE, 0xF8, 0x97, 0x41, 0x6E, 0xBC, 0xE2, 0x47, 0xC6, 0xAE,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz01234567",
      .output = {
          0xFA, 0x75, 0xCD, 0x23, 0x99, 0x2C, 0x82, 0xCF, 0x11, 0x0B, 0x4C, 0xA1, 0xEE, 0x6A, 0x11, 0x86,
          0x15, 0x48, 0xE9, 0xBD, 0x9C, 0xCB, 0x63, 0x2C, 0x7B, 0x60, 0x1F, 0xC3, 0xCB, 0x10, 0x65, 0x9F,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz012345678",
      .output = {
          0x2F, 0x96, 0xFC, 0xD5, 0x47, 0x6D, 0x14, 0x65, 0xB0, 0xA9, 0x9B, 0x37, 0x31, 0xCA, 0xF2, 0x41,
          0x4B, 0xD2, 0xF0, 0x90, 0x10, 0xEE, 0x09, 0x44, 0x48, 0xBD, 0xB5, 0x59, 0x8A, 0xEC, 0xFF, 0xD2,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789",
      .output = {
          0xB0, 0xB9, 0x2F, 0x78, 0x81, 0x54, 0x3E, 0xFB, 0x77, 0xF3, 0x18, 0x6D, 0x81, 0x86, 0x09, 0x44,
          0x20, 0xA9, 0x00, 0x63, 0xBB, 0x5A, 0x38, 0xC7, 0x55, 0x1D, 0xFB, 0x3D, 0xAC, 0x2F, 0xEB, 0xB1,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789a",
      .output = {
          0x0B, 0xE1, 0x2A, 0x0C, 0xFC, 0xE8, 0xCF, 0xAF, 0xB4, 0x66, 0x2D, 0xBC, 0xFD, 0xD4, 0x21, 0xAF,
          0x55, 0x98, 0xE2, 0x01, 0x5D, 0xC8, 0xA3, 0x80, 0x5A, 0x68, 0xA7, 0x6D, 0x9D, 0xB0, 0xFE, 0xC3,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789ab",
      .output = {
          0x82, 0x0F, 0x15, 0xAE, 0x80, 0x73, 0x5E, 0x1B, 0x0A, 0x67, 0x6C, 0xA6, 0x9D, 0x36, 0xA1, 0x8D,
          0x86, 0x93, 0x21, 0x39, 0x84, 0xD5, 0x5B, 0x5E, 0x3A, 0x7C, 0xC9, 0x60, 0x45, 0x08, 0x49, 0x79,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abc",
      .output = {
          0xD8, 0x42, 0xF4, 0x26, 0xC3, 0x02, 0xDD, 0x36, 0xE7, 0x26, 0xD8, 0x59, 0xF0, 0xD3, 0x54, 0x3B,
          0xA9, 0xF3, 0x31, 0xE2, 0xA4, 0xFC, 0x93, 0xF9, 0x22, 0xC0, 0xDD, 0xFA, 0x60, 0x2E, 0x36, 0x32,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abcd",
      .output = {
          0x50, 0xA4, 0xDE, 0x4F, 0x65, 0x9A, 0x28, 0x2C, 0xD0, 0x99, 0x68, 0x60, 0x12, 0xDB, 0xD9, 0xAF,
          0x2C, 0x1F, 0xD9, 0x7B, 0x50, 0x8E, 0xE8, 0x7B, 0xF6, 0x5F, 0x6F, 0x3E, 0x7F, 0x67, 0xB5, 0xF9,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abcde",
      .output = {
          0x05, 0xC5, 0x21, 0xE1, 0x77, 0x93, 0xF5, 0x5D, 0xAF, 0x1D, 0x3A, 0xDD, 0xD1, 0x3A, 0xC8, 0xF7,
          0x84, 0x51, 0xAF, 0xE4, 0x1C, 0x3D, 0xAC, 0x3D, 0xE5, 0x5D, 0x9F, 0x11, 0xE8, 0x31, 0xED, 0x2B,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abcdef",
      .output = {
          0x1D, 0x7D, 0x82, 0xB2, 0xD2, 0x17, 0xD9, 0xDF, 0xCB, 0xC6, 0xD9, 0x72, 0x47, 0x22, 0x0C, 0xC5,
          0x2D, 0xF1, 0x0F, 0xAF, 0xD4, 0x51, 0x61, 0xD2, 0x6A, 0x36, 0x36, 0x5D, 0x0E, 0xB8, 0xDD, 0x65,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abcdefg",
      .output = {
          0xC7, 0x82, 0x41, 0x6B, 0xF3, 0xE7, 0x40, 0x6B, 0x1A, 0xFD, 0xC8, 0x2A, 0xFB, 0x6D, 0xE6, 0xB9,
          0x15, 0xFF, 0x83, 0x48, 0x2D, 0x61, 0x11, 0x8E, 0xE1, 0xC0, 0x35, 0xE6, 0x48, 0x39, 0x9E, 0xE6,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abcdefgh",
      .output = {
          0x0C, 0xB5, 0x2C, 0xD0, 0x1B, 0x97, 0x54, 0x0F, 0x87, 0x3E, 0xD6, 0x71, 0x9D, 0x5F, 0xF6, 0xFE,
          0xB1, 0xE1, 0x46, 0x91, 0x35, 0x50, 0x0E, 0x6E, 0xD5, 0x9D, 0x21, 0x41, 0x43, 0xD9, 0x50, 0xC2,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abcdefghi",
      .output = {
          0x6F, 0xE1, 0xD4, 0x04, 0x47, 0x58, 0x8C, 0x8D, 0xD9, 0x7B, 0x63, 0x72, 0xE4, 0x85, 0xD9, 0x33,
          0x63, 0x36, 0x2A, 0x5B, 0xF6, 0x4E, 0x4C, 0x1B, 0x34, 0x1B, 0xD7, 0xF7, 0xFF, 0x86, 0x81, 0xFC,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abcdefghij",
      .output = {
          0xB4, 0x75, 0xF1, 0x63, 0xEF, 0x54, 0x19, 0x19, 0x01, 0x9D, 0x5B, 0xF2, 0x87, 0xC5, 0x6E, 0xD6,
          0x47, 0x24, 0xFD, 0x54, 0x86, 0x5A, 0x6A, 0xC1, 0xF0, 0x1D, 0x20, 0x06, 0x23, 0x29, 0x85, 0x01,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abcdefghijk",
      .output = {
          0x57, 0xA5, 0xD1, 0x5A, 0xAB, 0x13, 0x3A, 0x41, 0x25, 0xBA, 0x8E, 0xFC, 0x97, 0x90, 0x48, 0x16,
          0x6A, 0x21, 0x58, 0x5F, 0x47, 0xDA, 0xC9, 0x64, 0xA6, 0x4C, 0xCA, 0xD0, 0x49, 0xF9, 0x5B, 0xC1,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abcdefghijkl",
      .output = {
          0x40, 0x9F, 0x20, 0x6E, 0xBE, 0x1D, 0x31, 0x1C, 0x2E, 0x97, 0x16, 0xC6, 0x8F, 0x81, 0xBF, 0x7D,
          0xA2, 0x2A, 0xC3, 0x27, 0x10, 0x07, 0xF6, 0x15, 0x54, 0x0D, 0xF8, 0xA3, 0x22, 0x54, 0x08, 0xA0,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklm",
      .output = {
          0xC1, 0x1A, 0x7C, 0x91, 0xAC, 0xC9, 0x02, 0xA6, 0xC5, 0x41, 0xFC, 0x0C, 0x79, 0x49, 0xDC, 0x86,
          0xF5, 0xBE, 0xCD, 0x3E, 0xFD, 0x21, 0x89, 0x64, 0xD2, 0x36, 0x1A, 0x9D, 0xEB, 0xC9, 0xD6, 0x24,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmn",
      .output = {
          0xC4, 0xBB, 0x86, 0x95, 0x20, 0x61, 0xEC, 0xB5, 0x97, 0x16, 0x3E, 0xB3, 0xAD, 0xD6, 0xAB, 0x55,
          0xEB, 0x76, 0x25, 0xCD, 0xA7, 0x43, 0x89, 0x39, 0xF0, 0x58, 0xFD, 0x37, 0x43, 0xF7, 0x50, 0xE6,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmno",
      .output = {
          0x52, 0x37, 0x53, 0x3B, 0x57, 0x4F, 0x97, 0xAE, 0x1F, 0x93, 0xEE, 0x00, 0x56, 0x59, 0xCD, 0xCB,
          0x2D, 0x93, 0xF5, 0x28, 0x2D, 0x88, 0x12, 0xCD, 0xCD, 0xF1, 0xB2, 0x3C, 0xE6, 0xC0, 0x5D, 0xE1,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnop",
      .output = {
          0x12, 0x31, 0x05, 0x55, 0x14, 0x80, 0x59, 0xFD, 0x7D, 0x68, 0x56, 0xD8, 0x66, 0x5D, 0xBB, 0xCF,
          0xC8, 0x27, 0x88, 0x7F, 0x4F, 0xE3, 0x3E, 0x60, 0x5B, 0x3F, 0xF8, 0x3D, 0x5F, 0x42, 0xCB, 0x4B,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopq",
      .output = {
          0xF1, 0xEF, 0x42, 0xBD, 0x61, 0x26, 0x88, 0x75, 0x92, 0x98, 0x37, 0x2B, 0x04, 0x3C, 0xBB, 0x22,
          0x71, 0xA6, 0x51, 0x12, 0x0D, 0x99, 0xA4, 0x02, 0x52, 0xC0, 0x75, 0xC8, 0x32, 0x57, 0x61, 0xA1,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqr",
      .output = {
          0x39, 0xC9, 0x89, 0x0B, 0x86, 0xAC, 0xDF, 0xD8, 0xB8, 0x76, 0x4C, 0x78, 0x34, 0x62, 0x25, 0xF9,
          0xD0, 0x69, 0xCC, 0x53, 0xB8, 0xD8, 0xC3, 0xB9, 0xD5, 0xD9, 0x99, 0x22, 0xBA, 0x4E, 0x2C, 0x43,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrs",
      .output = {
          0x94, 0x84, 0xD7, 0x8C, 0x2C, 0x64, 0x9C, 0x38, 0x41, 0xE5, 0x95, 0xCD, 0x20, 0xA4, 0xD0, 0x87,
          0xBF, 0x52, 0xCE, 0x14, 0x69, 0xE2, 0x57, 0x08, 0xA4, 0x18, 0x32, 0x58, 0xC6, 0x1E, 0xD2, 0xEF,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrst",
      .output = {
          0x38, 0x5C, 0xC1, 0x1A, 0x36, 0x61, 0x12, 0xBE, 0x5B, 0xF3, 0x36, 0x32, 0xB3, 0x63, 0xD4, 0x95,
          0x5D, 0x29, 0x5F, 0x1F, 0x2B, 0x4C, 0xF0, 0x08, 0xBB, 0x0E, 0x67, 0x90, 0xB1, 0x17, 0xD3, 0xE6,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstu",
      .output = {
          0x52, 0x35, 0x52, 0x89, 0x00, 0xF4, 0xBC, 0x82, 0xF5, 0x47, 0x46, 0x33, 0x05, 0x87, 0xD1, 0x1B,
          0x8F, 0x20, 0x3E, 0x66, 0x35, 0xD8, 0x3A, 0xB7, 0x08, 0xC6, 0x9A, 0x95, 0xBC, 0x6E, 0xC7, 0xAD,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuv",
      .output = {
          0xD1, 0x40, 0x7E, 0x7D, 0x6B, 0x47, 0x49, 0xF9, 0x9F, 0xEB, 0x9C, 0xAE, 0x77, 0xFF, 0x4B, 0x3B,
          0x32, 0xA6, 0xD0, 0xD3, 0x6E, 0xB1, 0xA2, 0x79, 0x28, 0xBD, 0xAB, 0x1A, 0x98, 0x21, 0xF0, 0xD7,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvw",
      .output = {
          0x4F, 0xE7, 0xCC, 0x9F, 0x96, 0x3F, 0x77, 0x03, 0xB4, 0x48, 0x26, 0xEC, 0x47, 0x6E, 0x63, 0x3F,
          0x22, 0xCA, 0x25, 0x97, 0xAE, 0x1A, 0x5B, 0x75, 0xF8, 0x4A, 0xFE, 0x6C, 0x8A, 0x04, 0xAD, 0x56,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwx",
      .output = {
          0xD0, 0x50, 0x10, 0x40, 0xA4, 0xCE, 0x8E, 0xB2, 0x73, 0x55, 0x19, 0xC3, 0xFB, 0xED, 0x76, 0x5E,
          0x9D, 0x80, 0x42, 0xDD, 0x3B, 0xD4, 0x3F, 0xF9, 0x07, 0xCC, 0xD9, 0x5D, 0xCC, 0x17, 0xC6, 0xCC,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxy",
      .output = {
          0xE8, 0x8C, 0xAF, 0x20, 0x5D, 0x3C, 0x9F, 0x8F, 0x82, 0x2F, 0x65, 0x3A, 0xD5, 0x80, 0x9F, 0x43,
          0xD1, 0xF9, 0xD4, 0x6A, 0x3E, 0x45, 0xA9, 0xEB, 0xCF, 0xF2, 0xE6, 0xC0, 0x64, 0x38, 0xF8, 0x7D,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz",
      .output = {
          0x23, 0xCE, 0xAA, 0xFD, 0xAC, 0x74, 0xFB, 0xB0, 0x87, 0x33, 0xC0, 0x03, 0x25, 0xA6, 0x96, 0x40,
          0xEE, 0x85, 0xC9, 0xB3, 0x32, 0x68, 0x2C, 0x5A, 0xE2, 0x68, 0xB4, 0x53, 0x90, 0x48, 0x7C, 0x6A,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0",
      .output = {
          0xD4, 0x91, 0x25, 0x0A, 0x64, 0xC0, 0xA6, 0xB6, 0xDB, 0x2D, 0xDE, 0x1A, 0xEA, 0x38, 0x92, 0xEE,
          0x56, 0x47, 0x8D, 0x2B, 0x26, 0xC4, 0x26, 0xE2, 0xA2, 0x52, 0xE5, 0x39, 0x37, 0x5F, 0xFB, 0x59,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz01",
      .output = {
          0xF7, 0xF8, 0x54, 0x5A, 0x00, 0x36, 0x5D, 0xE0, 0x08, 0x90, 0xAF, 0x80, 0x89, 0x96, 0xED, 0x71,
          0x87, 0x8A, 0xDA, 0x34, 0x9A, 0x98, 0xD2, 0xCB, 0x5B, 0x91, 0x06, 0xC1, 0x95, 0x60, 0x71, 0x37,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz012",
      .output = {
          0xF5, 0x2B, 0x8E, 0x5E, 0x75, 0xC5, 0x6B, 0x8E, 0xAD, 0x21, 0xE5, 0xEF, 0x19, 0x19, 0xBD, 0xA7,
          0x30, 0x70, 0x8B, 0xA3, 0x3F, 0x9F, 0x24, 0x6A, 0x73, 0xC4, 0x03, 0xE1, 0x41, 0xCE, 0xED, 0x0F,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123",
      .output = {
          0x8D, 0x07, 0x4A, 0xB3, 0xB4, 0x1A, 0xF8, 0xCF, 0x10, 0xCB, 0x52, 0x60, 0x6A, 0xED, 0xEC, 0x0B,
          0xFB, 0x8D, 0xD9, 0xF0, 0xD5, 0x22, 0xA8, 0xAA, 0xD4, 0x5C, 0x4C, 0x50, 0x01, 0x60, 0xF3, 0x07,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz01234",
      .output = {
          0x35, 0xFF, 0xDE, 0x6F, 0x4A, 0xF5, 0xE6, 0x5F, 0x5E, 0xCF, 0x17, 0x46, 0x4A, 0xE6, 0xDE, 0x27,
          0x56, 0x06, 0x5F, 0xAF, 0x72, 0xF6, 0x3A, 0xD9, 0x02, 0xBD, 0x0E, 0x56, 0x2B, 0xB7, 0x18, 0x94,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz012345",
      .output = {
          0xFE, 0x4F, 0x12, 0xD6, 0x2E, 0xC1, 0x73, 0x6E, 0x99, 0x4A, 0x78, 0xD8, 0xEF, 0x66, 0x7E, 0x5B,
          0x35, 0xB3, 0x03, 0x74, 0x85, 0x76, 0x0E, 0x8F, 0xFA, 0xDD, 0xE2, 0x41, 0xA6, 0x19, 0x34, 0x66,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456",
      .output = {
          0xA3, 0x27, 0xA8, 0xF0, 0xCE, 0xF2, 0x24, 0x4E, 0x39, 0x3F, 0xE9, 0x8B, 0xA7, 0xE5, 0x59, 0x5C,
          0x5E, 0x40, 0xE4, 0x35, 0x93, 0xE5, 0x87, 0xCE, 0x55, 0x43, 0x02, 0x1C, 0xD5, 0xF9, 0x4C, 0xAD,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz01234567",
      .output = {
          0xD2, 0x17, 0xD0, 0xA3, 0xEC, 0x35, 0x28, 0x99, 0xDD, 0xB1, 0xD0, 0x38, 0xE5, 0x33, 0x6A, 0xE7,
          0x15, 0x56, 0xC0, 0xEA, 0x61, 0x2A, 0xF9, 0x70, 0xCB, 0x75, 0xD4, 0x9B, 0x1E, 0x25, 0x36, 0x6E,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz012345678",
      .output = {
          0x05, 0x5E, 0x47, 0x72, 0x8E, 0x3C, 0xE5, 0xD4, 0x83, 0xBD, 0xB4, 0x8F, 0x47, 0x14, 0x5C, 0xF6,
          0xF7, 0x31, 0xF5, 0x0F, 0xC9, 0x34, 0xA1, 0xF6, 0x4B, 0x58, 0xBD, 0xE6, 0x41, 0x38, 0x38, 0x07,
      } },
    test_vector{ .input = "abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrstuvwxyz0123456789",
      .output = {
          0xAA, 0x60, 0x21, 0x6D, 0xE8, 0x21, 0x17, 0x5F, 0x97, 0x3E, 0x38, 0x26, 0xED, 0x7A, 0x0B, 0x74,
          0x31, 0xEC, 0x87, 0xE8, 0xE2, 0x19, 0x2E, 0x80, 0x24, 0x12, 0x53, 0xB2, 0xA9, 0x4D, 0xB0, 0x11,
      }}
};

TEST(MiscBlake3s, TestVectors)
{
    barretenberg::constexpr_for<0, 1, 73>([&]<size_t index>() {
        constexpr auto v = test_vectors[index];
        std::vector<uint8_t> input(v.input.begin(), v.input.end());
        auto result_vector = blake3::blake3s(input);
        std::array<uint8_t, 32> result;
        std::copy(result_vector.begin(), result_vector.end(), result.begin());

        EXPECT_EQ(result, v.output);

        // There's no such thing as a compile-time pointer to &input_array[0] if array is empty.
        // We use `dummy_array` as a workaround for this edge-case
        constexpr std::array<uint8_t, 1> dummy_array{ 0 };
        constexpr size_t S = index > 0 ? v.input.size() : 1;
        constexpr std::array<uint8_t, S> input_array = index > 0 ? convert<S>(v.input) : dummy_array;
        constexpr std::array<uint8_t, 32> result_constexpr =
            blake3::blake3s_constexpr(&input_array[0], index > 0 ? S : 0);
        EXPECT_EQ(result_constexpr, v.output);
        static_assert(result_constexpr == v.output);
    });
}
