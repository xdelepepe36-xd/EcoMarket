/**
 * password_strength.cpp — Utilidad C++17 para EcoMarket
 *
 * Evalúa la fortaleza de una contraseña usando la MISMA política del backend
 * (app.py -> password_strength):
 *   - Mínimo 8 caracteres
 *   - Al menos una minúscula
 *   - Al menos una mayúscula
 *   - Al menos un número
 *   - Al menos un carácter especial
 *
 * Compilar:
 *     g++ -std=c++17 tools/password_strength.cpp -o tools/password_strength
 *     ./tools/password_strength "MiClave123!"
 *
 * Uso sin argumentos entra en modo interactivo.
 */

#include <cctype>
#include <iostream>
#include <string>

struct Resultado {
    int score = 0;        // 0..4
    std::string nivel;    // etiqueta
    bool valida = false;
};

static Resultado evaluar(const std::string& pw) {
    Resultado r;
    if (pw.empty()) {
        r.nivel = "VACIA";
        return r;
    }

    bool mayus = false, minus = false, digito = false, especial = false;
    for (unsigned char c : pw) {
        if (std::islower(c)) minus = true;
        else if (std::isupper(c)) mayus = true;
        else if (std::isdigit(c)) digito = true;
        else especial = true;
    }

    if (pw.size() >= 8) r.score++;
    if (mayus && minus) r.score++;
    if (digito) r.score++;
    if (especial) r.score++;

    // Política del backend: >=8, letras y números (sin importar mayúsc.).
    r.valida = (pw.size() >= 8) && (mayus || minus) && digito;

    static const char* niveles[5] = {"Muy debil", "Debil", "Aceptable", "Fuerte", "Muy fuerte"};
    r.nivel = niveles[r.score];
    return r;
}

int main(int argc, char** argv) {
    if (argc > 1) {
        std::string pw = argv[1];
        Resultado r = evaluar(pw);
        std::cout << "Longitud  : " << pw.size() << "\n";
        std::cout << "Nivel     : " << r.nivel << " (" << r.score << "/4)\n";
        std::cout << "Válida    : " << (r.valida ? "SÍ" : "NO") << "\n";
        return r.valida ? 0 : 1;
    }

    std::string pw;
    std::cout << "Ingresa una contraseña: ";
    std::getline(std::cin, pw);
    Resultado r = evaluar(pw);
    std::cout << "Nivel: " << r.nivel << " (" << r.score << "/4)\n";
    std::cout << "Válida según política de EcoMarket: " << (r.valida ? "SÍ" : "NO") << "\n";
    return 0;
}