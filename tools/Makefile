# Makefile de las utilidades C++ de EcoMarket
# Requisito: compilador con soporte C++17 (g++, clang++, etc.)
# Uso:
#   make            -> compila todas las herramientas
#   make clean      -> borra los binarios

CXX      = g++
CXXFLAGS = -std=c++17 -O2 -Wall -Wextra

BIN     = catalogo_stats password_strength
SRC     = $(addsuffix .cpp, $(BIN))

all: $(BIN)

%: %.cpp
	$(CXX) $(CXXFLAGS) $< -o $@

catalogo_stats: catalogo_stats.cpp

password_strength: password_strength.cpp

clean:
	rm -f $(BIN) *.exe

.PHONY: all clean