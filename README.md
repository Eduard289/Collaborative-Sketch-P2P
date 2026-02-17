# Collaborative-Sketch-P2P
Collaborative-Sketch-P2P es una herramienta gratuita B2B para empresas. Es una solución de pizarra colaborativa de alto rendimiento diseñada bajo el paradigma Peer-to-Peer (P2P). 

#Collaborative-Sketch-P2P es una solución de pizarra colaborativa de alto rendimiento diseñada bajo el paradigma Peer-to-Peer (P2P). A diferencia de las aplicaciones de dibujo convencionales que dependen de un servidor centralizado para procesar y retransmitir datos, Collaborative-Sketch-P2P utiliza la tecnología WebRTC (Web Real-Time Communication) para establecer una conexión directa entre los navegadores de los usuarios. Este enfoque elimina la necesidad de una infraestructura de backend costosa, garantizando una latencia mínima y una privacidad de datos superior, ya que la información del trazo viaja exclusivamente entre los nodos conectados.

El núcleo técnico del proyecto se apoya en PeerJS, una abstracción de WebRTC que gestiona el intercambio de señales inicial y la generación de IDs únicos. Una vez establecido el "apretón de manos" (handshake), se abre un canal de datos bidireccional que transporta objetos JSON ligeros con coordenadas vectoriales, propiedades de color y grosor de línea. Al renderizar los trazos mediante la API Canvas de HTML5, la aplicación logra una experiencia de dibujo fluida y síncrona, permitiendo que varios usuarios interactúen sobre el mismo lienzo como si estuvieran en la misma habitación.

P2Paint no es solo una herramienta de dibujo; es un ecosistema de colaboración ligera orientado a:

Equipos de Desarrollo y UX: Para realizar sesiones de brainstorming o flujos de usuario rápidos durante llamadas técnicas.

Educación Remota: Facilitando a tutores la explicación de conceptos visuales sin herramientas pesadas.

Privacidad Total: Al no existir un servidor intermedio, no hay registros de los dibujos en ninguna base de datos externa.
