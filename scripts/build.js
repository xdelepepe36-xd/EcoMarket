/**
 * EcoMarket - Build Script
 * Script de build para optimizar assets
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class EcoMarketBuild {
    constructor(options = {}) {
        this.options = {
            sourceDir: path.join(__dirname, '..'),
            outputDir: path.join(__dirname, '..', 'dist'),
            cssDir: path.join(__dirname, '..', 'css'),
            jsDir: path.join(__dirname, '..', 'js'),
            staticDir: path.join(__dirname, '..', 'static'),
            minify: true,
            sourcemaps: true,
            ...options
        };
    }

    /**
     * Ejecuta el build completo
     */
    async build() {
        console.log('🚀 Starting EcoMarket build...');
        
        try {
            await this.clean();
            await this.buildCSS();
            await this.buildJS();
            await this.optimizeImages();
            await this.copyAssets();
            await this.generateManifest();
            
            console.log('✅ Build completed successfully!');
        } catch (error) {
            console.error('❌ Build failed:', error);
            process.exit(1);
        }
    }

    /**
     * Limpia el directorio de output
     */
    async clean() {
        console.log('🧹 Cleaning output directory...');
        
        if (fs.existsSync(this.options.outputDir)) {
            fs.rmSync(this.options.outputDir, { recursive: true, force: true });
        }
        
        fs.mkdirSync(this.options.outputDir, { recursive: true });
    }

    /**
     * Build de CSS
     */
    async buildCSS() {
        console.log('🎨 Building CSS...');
        
        const cssOutputDir = path.join(this.options.outputDir, 'css');
        fs.mkdirSync(cssOutputDir, { recursive: true });

        // Leer archivos CSS
        const cssFiles = this.getFiles(this.options.cssDir, '.css');
        
        for (const file of cssFiles) {
            const content = fs.readFileSync(file, 'utf8');
            const filename = path.basename(file);
            const outputPath = path.join(cssOutputDir, filename);
            
            if (this.options.minify) {
                const minified = this.minifyCSS(content);
                fs.writeFileSync(outputPath.replace('.css', '.min.css'), minified);
            } else {
                fs.writeFileSync(outputPath, content);
            }
        }
    }

    /**
     * Build de JavaScript
     */
    async buildJS() {
        console.log('📜 Building JavaScript...');
        
        const jsOutputDir = path.join(this.options.outputDir, 'js');
        fs.mkdirSync(jsOutputDir, { recursive: true });

        // Leer archivos JS
        const jsFiles = this.getFiles(this.options.jsDir, '.js');
        
        for (const file of jsFiles) {
            const content = fs.readFileSync(file, 'utf8');
            const filename = path.basename(file);
            const outputPath = path.join(jsOutputDir, filename);
            
            if (this.options.minify) {
                const minified = this.minifyJS(content);
                fs.writeFileSync(outputPath.replace('.js', '.min.js'), minified);
            } else {
                fs.writeFileSync(outputPath, content);
            }
        }
    }

    /**
     * Optimiza imágenes
     */
    async optimizeImages() {
        console.log('🖼️  Optimizing images...');
        
        const imagesOutputDir = path.join(this.options.outputDir, 'images');
        fs.mkdirSync(imagesOutputDir, { recursive: true });

        // Copiar y optimizar imágenes del directorio static
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        const staticFiles = this.getFiles(this.options.staticDir, ...imageExtensions);
        
        for (const file of staticFiles) {
            const filename = path.basename(file);
            const outputPath = path.join(imagesOutputDir, filename);
            
            // Copiar archivo (en un caso real, aquí se optimizaría con sharp o similar)
            fs.copyFileSync(file, outputPath);
        }
    }

    /**
     * Copia assets adicionales
     */
    async copyAssets() {
        console.log('📦 Copying additional assets...');
        
        // Copiar archivos estáticos que no son CSS/JS/imágenes
        const assetsToCopy = [
            'robots.txt',
            'sitemap.xml',
            'manifest.json',
            'favicon.ico'
        ];

        for (const asset of assetsToCopy) {
            const sourcePath = path.join(this.options.staticDir, asset);
            if (fs.existsSync(sourcePath)) {
                const destPath = path.join(this.options.outputDir, asset);
                fs.copyFileSync(sourcePath, destPath);
            }
        }
    }

    /**
     * Genera manifest de assets
     */
    async generateManifest() {
        console.log('📋 Generating asset manifest...');
        
        const manifest = {
            version: new Date().toISOString(),
            assets: {}
        };

        // Añadir CSS
        const cssFiles = this.getFiles(path.join(this.options.outputDir, 'css'), '.css');
        cssFiles.forEach(file => {
            const filename = path.basename(file);
            manifest.assets[filename] = {
                path: `css/${filename}`,
                size: fs.statSync(file).size,
                type: 'stylesheet'
            };
        });

        // Añadir JS
        const jsFiles = this.getFiles(path.join(this.options.outputDir, 'js'), '.js');
        jsFiles.forEach(file => {
            const filename = path.basename(file);
            manifest.assets[filename] = {
                path: `js/${filename}`,
                size: fs.statSync(file).size,
                type: 'script'
            };
        });

        // Añadir imágenes
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        const imageFiles = this.getFiles(path.join(this.options.outputDir, 'images'), ...imageExtensions);
        imageFiles.forEach(file => {
            const filename = path.basename(file);
            manifest.assets[filename] = {
                path: `images/${filename}`,
                size: fs.statSync(file).size,
                type: 'image'
            };
        });

        fs.writeFileSync(
            path.join(this.options.outputDir, 'manifest.json'),
            JSON.stringify(manifest, null, 2)
        );
    }

    /**
     * Obtiene archivos de un directorio por extensión
     */
    getFiles(dir, ...extensions) {
        const files = [];
        
        if (!fs.existsSync(dir)) return files;

        const items = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            
            if (item.isDirectory()) {
                files.push(...this.getFiles(fullPath, ...extensions));
            } else if (extensions.some(ext => item.name.endsWith(ext))) {
                files.push(fullPath);
            }
        }
        
        return files;
    }

    /**
     * Minifica CSS (básico)
     */
    minifyCSS(css) {
        return css
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
            .replace(/\s+/g, ' ') // Collapse whitespace
            .replace(/\s*([{}:;,])\s*/g, '$1') // Remove space around special chars
            .replace(/;\}/g, '}') // Remove last semicolon
            .trim();
    }

    /**
     * Minifica JavaScript (básico)
     */
    minifyJS(js) {
        return js
            .replace(/\/\/.*$/gm, '') // Remove single-line comments
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
            .replace(/\s+/g, ' ') // Collapse whitespace
            .replace(/\s*([{}:;,=+\-*\/\(\)<>])\s*/g, '$1') // Remove space around operators
            .trim();
    }

    /**
     * Watch mode para desarrollo
     */
    watch() {
        console.log('👀 Watching for changes...');
        
        const chokidar = require('chokidar');
        
        const watcher = chokidar.watch([
            this.options.cssDir,
            this.options.jsDir,
            this.options.staticDir
        ], {
            ignored: /node_modules/,
            persistent: true
        });

        watcher.on('change', async (path) => {
            console.log(`📝 File changed: ${path}`);
            await this.build();
        });
    }
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const command = args[0] || 'build';
    
    const build = new EcoMarketBuild({
        minify: !args.includes('--no-minify'),
        sourcemaps: !args.includes('--no-sourcemaps')
    });

    switch (command) {
        case 'build':
            build.build();
            break;
        case 'watch':
            build.watch();
            break;
        case 'clean':
            build.clean();
            break;
        default:
            console.log('Usage: node build.js [build|watch|clean] [--no-minify] [--no-sourcemaps]');
    }
}

module.exports = EcoMarketBuild;