/**
 * catalogo_stats.cpp — Utilidad en C++17 para EcoMarket
 *
 * Analiza data/products.json y genera un reporte estadístico del catálogo:
 *   - Total de productos
 *   - Productos por categoría
 *   - Productos por condición (nuevo/usado)
 *   - Precio mínimo, máximo y promedio
 *   - Stock total
 *
 * Compilar (recomendado C++17):
 *     g++ -std=c++17 tools/catalogo_stats.cpp -o tools/catalogo_stats
 *     ./tools/catalogo_stats data/products.json
 *
 * Pureza: sin librerías externas (usa <regex> de la STL).
 */

#include <algorithm>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <map>
#include <regex>
#include <string>

struct Stats {
    long productos = 0;
    double precio_min = 1e18, precio_max = -1e18, precio_sum = 0.0;
    long stock_total = 0;
    std::map<std::string, long> por_categoria;
    std::map<std::string, long> por_condicion;
};

static double parsePrecio(const std::string& linea) {
    std::smatch m;
    if (std::regex_search(linea, m, std::regex(R"("precio"\s*:\s*([0-9]*\.?[0-9]+))")))
        return std::stod(m[1].str());
    return 0.0;
}

static long parseEntero(const std::string& linea, const char* campo) {
    std::string patron = std::string(R"(")") + campo + R"("\s*:\s*([0-9]+))";
    std::smatch m;
    if (std::regex_search(linea, m, std::regex(patron)))
        return std::stol(m[1].str());
    return 0;
}

static std::string parseTexto(const std::string& linea, const char* campo) {
    std::string patron = std::string(R"(")") + campo + R"("\s*:\s*"([^"]*))";
    std::smatch m;
    if (std::regex_search(linea, m, std::regex(patron)))
        return m[1].str();
    return "(sin dato)";
}

int main(int argc, char** argv) {
    const std::string ruta = (argc > 1) ? argv[1] : "data/products.json";
    std::ifstream archivo(ruta);
    if (!archivo) {
        std::cerr << "[ERROR] No se pudo abrir: " << ruta << "\n";
        return 1;
    }

    Stats st;
    std::string linea;
    const std::regex lineaProducto(R"(\{\s*"id"\s*:)");

    while (std::getline(archivo, linea)) {
        if (!std::regex_search(linea, lineaProducto))
            continue;  // No es una línea de producto

        st.productos++;
        double precio = parsePrecio(linea);
        st.precio_min = std::min(st.precio_min, precio);
        st.precio_max = std::max(st.precio_max, precio);
        st.precio_sum += precio;
        st.stock_total += parseEntero(linea, "stock");

        std::string cat = parseTexto(linea, "categoria");
        std::string cond = parseTexto(linea, "condicion");
        st.por_categoria[cat]++;
        st.por_condicion[cond]++;
    }

    if (st.productos == 0) {
        std::cerr << "[ERROR] No se encontraron productos en " << ruta << "\n";
        return 2;
    }

    std::cout << "\n== EcoMarket: Reporte del catalogo (" << ruta << ") ==\n";
    std::cout << "Total de productos : " << st.productos << "\n";
    std::cout << "Stock total        : " << st.stock_total << "\n";
    std::cout << "Precio minimo      : S/. " << std::fixed << std::setprecision(2) << st.precio_min << "\n";
    std::cout << "Precio maximo      : S/. " << std::fixed << std::setprecision(2) << st.precio_max << "\n";
    std::cout << "Precio promedio    : S/. " << std::fixed << std::setprecision(2)
              << (st.precio_actual / st.productos) << "\n";

    std::cout << "\nPor categoria:\n";
    for (const auto& [c, n] : st.por_categoria)
        std::cout << "  - " << c << " : " << n << "\n";

    std::cout << "\nPor condicion:\n";
    for (const auto& [c, n] : st.por_condicion)
        std::cout << "  - " << c << " : " << n << "\n";

    std::cout << "\n[OK] Reporte generado correctamente.\n";
    return 0;
}