const loadBtn = document.getElementById('loadBtn');
const loading = document.getElementById('loading');
const message = document.getElementById('message');
const newsContainer = document.getElementById('newsContainer');

// Tu API key de NewsAPI
const API_KEY = '59a8c9facd874199b6369f8d4173e79f';

// URL del proxy CORS local
const PROXY_URL = 'http://localhost:8001/proxy';

loadBtn.addEventListener('click', loadNews);

async function loadNews() {
    try {
        // Mostrar loading
        loadBtn.disabled = true;
        loading.style.display = 'block';
        message.innerHTML = '';
        newsContainer.innerHTML = '';

        // Obtener valores seleccionados
        const mode = document.getElementById('modeSelect').value;
        const category = document.getElementById('categorySelect').value;
        const country = document.getElementById('countrySelect').value;

        let data;

        if (mode === 'direct') {
            // Modo directo: llamar a NewsAPI a través del proxy
            data = await loadNewsDirect(category, country);
        } else {
            // Modo función: llamar a GetNews
            data = await loadNewsFunction(category, country);
        }

        if (data.status) {
            if (data.articles && data.articles.length > 0) {
                // Mostrar mensaje de éxito
                const modeText = mode === 'direct' ? 'directamente desde NewsAPI' : 'a través de GetNews';
                message.innerHTML = `<div class="success">✅ Se cargaron ${data.articles.length} noticias de ${category} de ${country} </div>`;

                // Mostrar noticias
                displayNews(data.articles);
            } else {
                // No hay noticias pero la API funciona
                message.innerHTML = `<div class="error">⚠️ No se encontraron noticias de ${category} en ${country}. Intenta con otra categoría o país.</div>`;
                newsContainer.innerHTML = `
                            <div style="text-align: center; padding: 20px; color: #666;">
                                <p>No hay noticias disponibles para esta combinación.</p>
                                <p>Prueba cambiando la categoría o el país.</p>
                                <p><strong>Total de resultados:</strong> ${data.totalResults || 0}</p>
                            </div>
                        `;
            }
        } else {
            throw new Error(data.error || 'Error en la respuesta');
        }

    } catch (error) {
        console.error('Error:', error);

        // Mensaje de error más específico
        let errorMessage = error.message;
        if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Error de conexión. Verifica que la función esté disponibles.';
        }

        message.innerHTML = `<div class="error">❌ Error: ${errorMessage}</div>`;
    } finally {
        // Ocultar loading
        loadBtn.disabled = false;
        loading.style.display = 'none';
    }
}

// Función para cargar noticias directamente desde NewsAPI
async function loadNewsDirect(category, country) {
    const newsApiUrl = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apiKey=${API_KEY}`;
    const proxyUrl = `${PROXY_URL}/${encodeURIComponent(newsApiUrl)}`;


    const response = await fetch(newsApiUrl);

    if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📰 Respuesta directa de NewsAPI:', data);

    // Convertir respuesta de NewsAPI al formato estándar
    return {
        success: data.status === 'ok',
        articles: data.articles || [],
        totalResults: data.totalResults || 0,
        country: country,
        category: category
    };
}


async function logAccess() {
    const apiUrl = `https://labcloudtpnd-cve3b3c3grg4dcb9.centralindia-01.azurewebsites.net/api/LogAccess?&code=dUjEXxywdcoYBLJ1ty9mAnP_tcPyfhq7JAuYhVkopSuwAzFuhh-3mg==`;

    try {

        const response = await fetch(apiUrl, {
            method: "GET" // or "POST" if you later change your function to accept body data
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        console.log("API Response:", text);
    } catch (error) {
        console.error("Error calling LogAccess function:", error);
    }
}

// Función para cargar noticias a través de GetNews
async function loadNewsFunction(category, country) {
    logAccess();
    const functionUrl = `https://labcloudtpnd-cve3b3c3grg4dcb9.centralindia-01.azurewebsites.net/api/GetNews?&code=dUjEXxywdcoYBLJ1ty9mAnP_tcPyfhq7JAuYhVkopSuwAzFuhh-3mg==`;
    console.log('⚡ Llamando a GetNews function:', functionUrl);

    const response = await fetch(functionUrl);

    if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📰 Respuesta de GetNews function:', data);

    return data;
}

function displayNews(articles) {
    const newsHTML = articles.map(article => `
                <div class="news-item">
                    <div class="news-title">
                        <a href="${article.url}" target="_blank">${article.title}</a>
                    </div>
                    <div class="news-description">
                        ${article.description || 'Sin descripción disponible'}
                    </div>
                    <div class="news-meta">
                        📰 ${article.source?.name || 'Fuente desconocida'} | 
                        🕒 ${formatDate(article.publishedAt)}
                    </div>
                </div>
            `).join('');

    newsContainer.innerHTML = newsHTML;
}

function formatDate(dateString) {
    if (!dateString) return 'Fecha desconocida';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return 'Fecha inválida';
    }
}
