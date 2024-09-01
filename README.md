
# Refuerzo ICFES - Proyecto productivo 2023 ITI L.P.N

Refuerzo ICFES es una aplicación web fullstack creada principalmente con Node.js, EJS y SCSS que permite a los estudiantes del ITI hacer simulacros virtuales de las diferentes materias que el ICFES evalúa para mejorar sus habilidades en el mismo.

## Vista Previa

Puedes ver una vista previa del proyecto en [https://icfes.criskop.com](https://icfes.criskop.com).

## Configuración del Proyecto para edición y desarrollo.

Sigue estos pasos para clonar o hacer un fork del proyecto y configurarlo localmente:

### 1. Haz un Fork del Proyecto (opcional)
Si deseas contribuir al proyecto, puedes hacer un fork del repositorio:
- Ve a la página principal del repositorio en GitHub.
- Haz clic en el botón "Fork" en la esquina superior derecha.
- Esto creará una copia del repositorio en tu cuenta de GitHub.

### 2. Clona el Repositorio
Clona el repositorio a tu máquina local usando Git:
```bash
git clone https://github.com/tu-usuario/tu-proyecto.git
```
Si hiciste un fork, clona el repositorio desde tu cuenta:
```bash
git clone https://github.com/tu-usuario/tu-fork.git
```

### 3. Instala las Dependencias
Navega al directorio del proyecto y ejecuta el siguiente comando para instalar las dependencias de Node.js:
```bash
npm install
```

### 4. Configura el Archivo `.env`
Antes de iniciar la aplicación, necesitas configurar las variables de entorno. Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:
```plaintext
ggl_client_id=
ggl_client_secret=
session_pass=
db_user=
db_pass=
```
Reemplaza los valores con las credenciales correspondientes.
Los 3 primeros valores son credenciales de la api OAuth2 de google y los ultimos 2 son credenciales de MongoDBAtlas

### 5. Inicia la Aplicación
Una vez configurado el archivo `.env`, puedes iniciar la aplicación con el siguiente comando:
```bash
npm start index.js
```

## Contribuir
Si deseas contribuir al proyecto, sigue estos pasos:
1. Haz un fork del proyecto (ver la sección [1. Haz un Fork del Proyecto](#1-haz-un-fork-del-proyecto-opcional)).
2. Crea una nueva rama para tus cambios:
   ```bash
   git checkout -b mi-nueva-rama
   ```
3. Realiza tus cambios y haz commit:
   ```bash
   git add .
   git commit -m "Descripción de tus cambios"
   ```
4. Empuja tus cambios a tu repositorio fork:
   ```bash
   git push origin mi-nueva-rama
   ```
5. Abre un Pull Request en el repositorio original y describe los cambios que has realizado.

### Revisión de Cambios
Tu contribución será revisada y, si todo está bien, será integrada al proyecto principal. ¡Gracias por contribuir!
