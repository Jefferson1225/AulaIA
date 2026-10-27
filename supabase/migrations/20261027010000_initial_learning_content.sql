-- Contenido introductorio de la primera entrega. Conserva lecciones e intentos existentes.
update public.courses set duration_hours=2 where slug in ('fundamentos-python','analisis-datos','ingles-profesional','algebra-machine-learning','diseno-interfaces','introduccion-ia');

insert into public.modules(course_slug,slug,title,position) values
 ('fundamentos-python','control-y-funciones','Decisiones, ciclos y funciones',2),
 ('analisis-datos','hojas-de-calculo','Organiza y analiza con hojas de cálculo',1),
 ('analisis-datos','consultas-sql','Consulta información con SQL',2),
 ('ingles-profesional','comunicacion-escrita','Comunicación escrita profesional',1),
 ('ingles-profesional','reuniones','Participación en reuniones',2),
 ('algebra-machine-learning','vectores','Vectores y operaciones',1),
 ('algebra-machine-learning','matrices','Matrices y modelos lineales',2),
 ('diseno-interfaces','bases-del-diseno','Jerarquía y componentes de interfaz',1),
 ('diseno-interfaces','accesibilidad','Accesibilidad y adaptación',2),
 ('introduccion-ia','conceptos-ia','Conceptos y aprendizaje automático',1),
 ('introduccion-ia','uso-responsable','Evaluación y uso responsable',2)
on conflict(course_slug,slug) do nothing;

insert into public.lessons(course_slug,module_slug,slug,title,position,duration_minutes,intro,content,example_code,tip) values
 ('fundamentos-python','fundamentos','operadores-y-expresiones','Operadores y expresiones',2,20,'Combina valores para calcular resultados y comprobar condiciones.','Una expresión combina valores, variables y operadores. En Python, + suma, - resta, * multiplica y / divide. Los paréntesis permiten controlar el orden: (2 + 3) * 4 da 20, mientras que 2 + 3 * 4 da 14.

Las comparaciones ==, !=, < y >= producen valores booleanos. = asigna un valor; == compara dos valores. Puedes combinar condiciones con and, or y not. Antes de calcular, identifica el tipo de cada dato y la unidad del resultado.

Práctica: guarda una cantidad de 5 productos y un precio de 8. Calcula el total y comprueba si alcanza un mínimo de compra de 30. Predice el resultado antes de ejecutar el ejemplo.','cantidad = 5
precio = 8
total = cantidad * precio
alcanza_minimo = total >= 30
print(total, alcanza_minimo)  # 40 True','No confundas asignación (=) con comparación (==).'),
 ('fundamentos-python','control-y-funciones','condiciones-y-ciclos','Condiciones y ciclos',1,25,'Elige qué instrucciones ejecutar y repite tareas con una estructura clara.','if ejecuta un bloque cuando su condición es verdadera; elif comprueba otra posibilidad y else atiende los demás casos. Python utiliza sangría para delimitar cada bloque. Mantén la misma indentación entre instrucciones del mismo nivel.

Un ciclo for recorre una secuencia. range(3) produce 0, 1 y 2: el límite final no se incluye. while repite un bloque mientras una condición siga siendo verdadera; revisa que alguna instrucción permita terminar el ciclo.

Práctica: recorre tres notas de ejemplo y muestra si cada una alcanza 12. Prueba valores menores, iguales y mayores que el límite. El ejemplo utiliza datos inventados para practicar; no consulta calificaciones de AulaIA.','notas = [8, 12, 17]
for nota in notas:
    if nota >= 12:
        print("Aprobado")
    else:
        print("Por reforzar")','Prueba siempre el valor exacto del límite de una condición.'),
 ('fundamentos-python','control-y-funciones','funciones-reutilizables','Funciones reutilizables',2,25,'Divide un programa en tareas con parámetros y valores de retorno.','Una función agrupa instrucciones bajo un nombre. Se define con def y se ejecuta al llamarla. Los parámetros representan la información que recibe y los argumentos son los valores concretos que entregas en una llamada.

return devuelve un resultado a quien llamó la función. Mostrar un valor con print() y devolverlo con return son acciones distintas: un resultado devuelto puede guardarse, compararse o utilizarse en otra operación. Prefiere funciones pequeñas con una tarea clara.

Práctica: escribe una función que reciba precio y cantidad y devuelva un subtotal. Comprueba dos cantidades diferentes. Después valida que no se acepten cantidades negativas.','def calcular_subtotal(precio, cantidad):
    return precio * cantidad

subtotal = calcular_subtotal(8, 5)
print(subtotal)  # 40','Una función puede llamarse varias veces con argumentos distintos.'),
 ('analisis-datos','hojas-de-calculo','datos-y-tablas','Datos ordenados y tablas',1,20,'Prepara registros consistentes antes de analizarlos.','Una tabla organiza registros en filas y atributos en columnas. En una tabla de ventas, una fila puede representar una venta y sus columnas pueden indicar fecha, producto, cantidad y precio. Usa encabezados claros y una unidad consistente por columna.

Revisa valores vacíos, duplicados y errores de escritura antes de resumir información. Una celda vacía no siempre equivale a cero: puede representar un dato desconocido. Conserva los datos originales para revisar tus transformaciones.

Ordenar cambia la posición de las filas; filtrar muestra únicamente las que cumplen una condición. Al ordenar, incluye toda la tabla para no separar los datos de un registro. Práctica: crea cinco ventas y filtra las que tengan cantidad mayor que dos.','Producto   Cantidad  Precio unitario
Cuaderno   3         8
Lápiz      5         2
Cuaderno   1         8','Una fila debe representar una observación y una columna, un atributo.'),
 ('analisis-datos','hojas-de-calculo','formulas-y-resumenes','Fórmulas y resúmenes',2,20,'Calcula importes y resume rangos con funciones básicas.','Una fórmula comienza con = y puede utilizar referencias a celdas. Si C2 contiene la cantidad y D2 el precio unitario, =C2*D2 calcula el importe. Al copiarla hacia abajo, las referencias relativas se ajustan.

SUMA agrega los valores de un rango y PROMEDIO calcula su media. Una referencia absoluta como $H$1 mantiene fija una celda al copiar una fórmula. Los nombres de funciones y separadores pueden variar según el idioma y la configuración de la aplicación.

Comprueba que los valores sean numéricos y que el rango incluya las filas relevantes. Práctica: calcula los importes de cinco ventas, su total y su promedio. Modifica una cantidad y observa cómo cambian los resultados.','Importe: =C2*D2
Total: =SUMA(E2:E6)
Promedio: =PROMEDIO(E2:E6)
Aplicar una tasa fija: =E2*$H$1','Revisa el rango y las unidades antes de interpretar un promedio.'),
 ('analisis-datos','consultas-sql','seleccionar-y-filtrar','Seleccionar y filtrar con SQL',1,25,'Consulta columnas y filas concretas de una tabla.','SELECT indica las columnas que se desean recuperar y FROM identifica la tabla. WHERE filtra filas mediante una condición. ORDER BY ordena el resultado y DESC indica un orden descendente. LIMIT reduce la cantidad de filas devueltas.

Una consulta de lectura permite explorar datos sin modificar los registros originales. Selecciona las columnas que necesitas y verifica el significado de las condiciones. Los valores de texto se escriben entre comillas simples.

El ejemplo supone una tabla de ejercicios llamada ventas con las columnas producto, cantidad y monto. AulaIA presenta el código como material de estudio; puedes practicar en una base preparada para ejercicios. Práctica: muestra cantidades iguales o mayores que cinco y ordena el monto de menor a mayor.','SELECT producto, cantidad, monto
FROM ventas
WHERE cantidad > 2
ORDER BY monto DESC
LIMIT 10;','WHERE filtra filas antes de presentar el resultado.'),
 ('analisis-datos','consultas-sql','agrupar-y-contar','Agrupar y contar resultados',2,25,'Obtén resúmenes por categoría mediante agregaciones.','COUNT(*) cuenta registros. SUM(monto) suma los valores no nulos de una columna y AVG(monto) calcula su promedio sobre los valores no nulos. COUNT(columna) cuenta valores no nulos, por lo que puede diferir de COUNT(*).

GROUP BY reúne filas con un mismo valor para producir un resultado por grupo. WHERE filtra filas antes de agrupar; HAVING filtra los grupos resultantes. Si seleccionas una columna sin agregarla, normalmente debe formar parte de GROUP BY.

Verifica el período y las unidades antes de interpretar un total. Práctica: calcula las ventas por producto y muestra solamente productos con al menos dos registros. Explica por qué ese resultado no demuestra la causa de una diferencia de ventas.','SELECT producto, COUNT(*) AS numero_ventas,
       SUM(monto) AS total
FROM ventas
GROUP BY producto
HAVING COUNT(*) >= 2
ORDER BY total DESC;','Un resumen depende de los datos filtrados y de la definición de los grupos.'),
 ('ingles-profesional','comunicacion-escrita','presentacion-profesional','Presentación profesional',1,20,'Presenta tu nombre, función y propósito con frases breves.','Una presentación profesional puede organizarse en tres partes: nombre, función y propósito. My name is introduce el nombre; I work as describe una función e I am responsible for introduce una responsabilidad. Si todavía estudias, puedes decir I am a student y mencionar tu área.

Adapta el vocabulario a lo que realmente haces. Preparar dos o tres frases claras suele ser más útil que memorizar un discurso largo. Una pregunta como Could you tell me about your role? invita a la otra persona a participar.

Práctica: escribe una presentación de tres frases para una reunión de proyecto. Léela en voz alta y verifica que se entiendan tu función y el motivo de tu participación.','Hello, my name is Ana.
I am a software development student.
I am responsible for testing our application.
Could you tell me about your role?','Prefiere frases cortas y un propósito concreto.'),
 ('ingles-profesional','comunicacion-escrita','correos-claros','Correos profesionales claros',2,25,'Organiza un correo con contexto, solicitud y cierre.','Un correo profesional debe permitir reconocer la acción esperada. Utiliza un asunto específico, un saludo, un contexto breve, una solicitud y un cierre. Could you please y Would you be available to permiten introducir peticiones corteses.

Si propones una fecha u hora, incluye suficiente contexto para evitar confusiones; confirma la zona horaria cuando corresponda. Revisa el destinatario y los archivos adjuntos mencionados antes de enviar. La claridad y el respeto son más útiles que las palabras complicadas.

Práctica: redacta un correo para solicitar la revisión de un prototipo. Indica qué parte debe revisarse y qué tipo de comentario necesitas.','Subject: Request for prototype feedback

Hello, Maria,
Could you please review the course registration flow?
We would appreciate feedback on the instructions.
Thank you for your time.
Best regards,
Ana','Indica la acción que necesitas y evita asuntos demasiado generales.'),
 ('ingles-profesional','reuniones','pedir-aclaraciones','Pedir aclaraciones en reuniones',1,20,'Confirma lo que entendiste antes de asumir una tarea.','Could you repeat that, please? solicita una repetición. Could you explain what you mean by...? pide explicar una expresión. Do you mean that...? permite comprobar una interpretación. Pedir una aclaración evita que el equipo trabaje con expectativas distintas.

Cuando confirmes una responsabilidad, resume la acción y el resultado esperado. Just to confirm, I will test the login page expresa una interpretación concreta que la otra persona puede corregir. Si no conoces un plazo, pregúntalo de forma directa y cortés.

Práctica: prepara dos preguntas para aclarar una tarea de revisión de interfaz y una frase que confirme qué harás. Explica qué información te faltaría antes de comprometer una fecha.','Could you repeat that, please?
What do you mean by "ready for review"?
Just to confirm, I will test the login page.
When do you need the results?','Reformular con tus propias palabras ayuda a confirmar acuerdos.'),
 ('ingles-profesional','reuniones','acuerdos-y-seguimiento','Acuerdos y seguimiento',2,25,'Resume decisiones, responsables y siguientes pasos.','Un resumen de reunión distingue decisiones, tareas y asuntos pendientes. Will permite describir una acción futura: Daniel will review the test results. Incluye un responsable y un plazo confirmado cuando existan.

Una decisión pendiente no debe presentarse como aprobada. Puedes utilizar pending confirmation para señalar que falta confirmar un dato. Las tareas deben ser observables: Review the registration form es más concreto que Improve everything.

Al terminar, Are these next steps correct? permite revisar el resumen con el equipo. Práctica: escribe una decisión, dos tareas y una pregunta pendiente de una reunión de proyecto. Comprueba que los acuerdos y las propuestas estén separados.','Decision: We will test student registration.
Next step: Ana will review the form instructions.
Next step: Daniel will check the test results.
Pending confirmation: the date of the next review.','Separa los acuerdos confirmados de las propuestas pendientes.'),
 ('algebra-machine-learning','vectores','vectores-y-dimensiones','Vectores y dimensiones',1,20,'Representa características mediante componentes ordenadas.','Un vector puede representarse como una lista ordenada de números. Su dimensión indica cuántas componentes contiene. Un vector con horas de estudio y ejercicios resueltos tiene dos componentes; su orden y unidades determinan cómo interpretarlo.

La suma de vectores de igual dimensión opera componente a componente. Multiplicar un vector por un escalar multiplica cada componente por ese número. Estas operaciones permiten transformar y combinar características en modelos.

Define el significado de cada componente y revisa su escala. Una variable medida en miles puede dominar determinadas operaciones frente a otra entre cero y uno. Práctica: propone tres características de una sesión de estudio e indica la unidad de cada una.','x = (2, 5)
y = (1, 3)
x + y = (3, 8)
2x = (4, 10)','Conserva el mismo significado para cada posición del vector.'),
 ('algebra-machine-learning','vectores','producto-punto','Producto punto',2,25,'Combina vectores de igual dimensión para obtener un escalar.','El producto punto multiplica las componentes correspondientes de dos vectores y suma los productos. Para (2, 3) y (4, 1), se calcula 2*4 + 3*1 = 11. El resultado es un escalar.

En un modelo lineal, un vector puede representar características y otro sus pesos. El producto punto produce una suma ponderada. Al añadir un sesgo b, puede escribirse y = w punto x + b. Comprueba que los vectores tengan la misma dimensión antes de operar.

El significado de la salida depende del modelo y de sus datos; calcular correctamente no garantiza una predicción adecuada. Práctica: calcula el producto punto de (1, 2, 3) y (2, 0, 1), y después añade un sesgo de 4.','x = (2, 3)
w = (4, 1)
w · x = 4*2 + 1*3 = 11
b = 2
y = 11 + 2 = 13','Multiplica por pares y suma al final.'),
 ('algebra-machine-learning','matrices','matrices-y-formas','Matrices y sus formas',1,20,'Reconoce filas, columnas y compatibilidad de dimensiones.','Una matriz es una disposición rectangular de números. Su forma se describe como filas por columnas. Una matriz de 3 por 2 contiene tres filas y dos columnas. Una convención habitual es representar observaciones en filas y características en columnas.

La transpuesta intercambia filas y columnas: una matriz de 3 por 2 pasa a 2 por 3. La suma requiere formas iguales. El producto de matrices sigue otra regla: si A es m por n y B es n por p, AB tiene forma m por p.

Revisar las dimensiones ayuda a detectar errores antes de calcular. Práctica: dibuja una matriz con cuatro estudiantes y tres características. Indica su forma, la de su transpuesta y qué representa una fila.','X = [ [2, 5],
      [3, 7],
      [1, 4] ]
Forma de X: 3 × 2
Forma de X transpuesta: 2 × 3','La forma no es lo mismo que la cantidad total de elementos.'),
 ('algebra-machine-learning','matrices','modelo-lineal','Un modelo lineal sencillo',2,25,'Interpreta una suma de características, pesos y sesgo.','Un modelo lineal combina características con pesos y añade un sesgo. Con dos características, una expresión posible es y = w1*x1 + w2*x2 + b. Para varias observaciones, estas operaciones pueden escribirse mediante una matriz y un vector.

Una matriz de tres observaciones y dos características puede multiplicarse por un vector de dos pesos para obtener tres resultados. A cada uno se añade el mismo sesgo. La compatibilidad de dimensiones permite operar; la calidad del modelo requiere evaluarlo con datos apropiados.

Los pesos del ejemplo fueron elegidos para practicar y no proceden de un modelo entrenado. Práctica: calcula la salida para x1 = 2, x2 = 4, w1 = 3, w2 = 1 y b = 2. Explica qué cambia al aumentar x1 en una unidad.','y = 3*x1 + 1*x2 + 2
Para x = (2, 4):
y = 3*2 + 1*4 + 2 = 12','Distingue un cálculo ilustrativo de una predicción validada.'),
 ('diseno-interfaces','bases-del-diseno','jerarquia-visual','Jerarquía visual',1,20,'Organiza la atención alrededor de la tarea principal.','La jerarquía visual utiliza tamaño, contraste, posición y espacio para organizar la atención. Un título identifica la página; los subtítulos agrupan información y la acción principal debe distinguirse de las secundarias.

Antes de decorar una pantalla, define qué necesita hacer la persona. En una página de curso puede ser revisar el contenido y matricularse. Organiza los elementos siguiendo una secuencia comprensible y utiliza etiquetas concretas.

El espacio separa grupos y la consistencia facilita reconocer patrones entre pantallas. Dar el mismo énfasis a todo dificulta identificar prioridades. Práctica: dibuja una página de curso con título, descripción, contenido y acción principal. Justifica el orden de lectura.','Título: Fundamentos de Python
Descripción: Variables, decisiones y funciones.
Contenido: 2 módulos · 4 lecciones
Acción principal: Matricularme
Acción secundaria: Volver al catálogo','Evalúa la pantalla según la tarea que facilita.'),
 ('diseno-interfaces','bases-del-diseno','componentes-y-estados','Componentes y estados',2,25,'Comunica disponibilidad, progreso, éxito y errores de una operación.','Un componente puede estar disponible, enfocado, deshabilitado, en proceso, con éxito o con error. Una acción que guarda información debe mostrar que está trabajando y comunicar su resultado.

Las etiquetas describen el propósito de los campos. Los mensajes de error deben orientar sobre qué revisar. Conservar la información cuando falla un envío evita que la persona repita todo el trabajo. Los botones deben describir acciones concretas, como Guardar lección.

Deshabilitar un botón durante el envío ayuda a evitar duplicados, pero el servidor también debe comprobarlos. Práctica: diseña los estados de una matrícula y escribe un mensaje para el caso en que ya exista.','Disponible: Matricularme
En proceso: Guardando matrícula…
Éxito: Tu matrícula quedó registrada.
Error: No se pudo guardar. Inténtalo de nuevo.','Un mensaje útil explica el resultado y el siguiente paso.'),
 ('diseno-interfaces','accesibilidad','accesibilidad-basica','Accesibilidad básica',1,20,'Facilita el uso con teclado, etiquetas y señales comprensibles.','Una interfaz accesible considera distintas formas de percibir y operar el contenido. Asocia etiquetas a los campos y permite alcanzar los elementos interactivos con teclado. El enfoque debe ser visible para reconocer dónde se encuentra la interacción.

No comuniques un resultado únicamente con color: acompáñalo con texto o símbolos comprensibles. Las imágenes informativas necesitan una alternativa textual apropiada. Utiliza títulos y elementos semánticos para conservar una estructura clara.

Una revisión básica permite detectar barreras, pero no demuestra el cumplimiento completo de un estándar. Práctica: recorre una pantalla con Tab y Enter y comprueba que puedas identificar los campos y completar la acción.','<label for="correo">Correo electrónico</label>
<input id="correo" name="correo" type="email" required>
<button type="submit">Crear cuenta</button>','Prueba con teclado y no dependas únicamente de una revisión visual.'),
 ('diseno-interfaces','accesibilidad','diseno-adaptable','Diseño adaptable',2,25,'Reorganiza el contenido según el espacio disponible.','El diseño adaptable cambia la distribución según el ancho disponible. Una cuadrícula puede utilizar varias columnas en una pantalla ancha y una sola en una pantalla pequeña. Deben conservarse la lectura, la navegación y la acción principal.

Evita anchos fijos que provoquen desplazamiento horizontal de toda la página. Los campos y botones deben permanecer utilizables. El código o las tablas anchas pueden tener un desplazamiento propio sin romper el resto de la interfaz.

Las consultas de medios de CSS permiten aplicar estilos según condiciones como el ancho de ventana. Práctica: prepara una cuadrícula de cursos con tres columnas y haz que pase a una por debajo de 700 píxeles. Prueba títulos de distintas longitudes.','.cursos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
@media (max-width: 700px) {
  .cursos { grid-template-columns: 1fr; }
}','Prueba el contenido real para detectar recortes y desbordamientos.'),
 ('introduccion-ia','conceptos-ia','que-es-ia','Qué es la inteligencia artificial',1,20,'Identifica tareas de IA y criterios para observar sus resultados.','La inteligencia artificial reúne técnicas para construir sistemas que realizan tareas como clasificar, reconocer patrones o generar contenido. Un sistema especializado en una tarea no necesariamente posee comprensión general del mundo.

El aprendizaje automático ajusta modelos a partir de datos. Un sistema basado en reglas utiliza condiciones definidas explícitamente. Ambas aproximaciones pueden combinarse dentro de una aplicación. Antes de elegir una técnica, define el problema, los datos disponibles y cómo evaluarás el resultado.

Una respuesta plausible todavía puede ser incorrecta. Práctica: identifica una tarea de clasificación y una de generación en una plataforma educativa. Explica qué observarías para valorar cada resultado.','Clasificación: asignar una categoría a una consulta.
Generación: redactar una explicación de una lección.
Regla explícita: permitir acceso solo a una sesión válida.','Describe la tarea y su evidencia antes de atribuir capacidades al sistema.'),
 ('introduccion-ia','conceptos-ia','aprendizaje-supervisado','Aprendizaje supervisado',2,25,'Relaciona ejemplos, etiquetas, entrenamiento y evaluación.','El aprendizaje supervisado utiliza ejemplos con una salida conocida o etiqueta. La clasificación predice categorías; la regresión predice valores numéricos. El tipo de salida determina qué problema se está planteando.

Se separan datos para entrenar y para evaluar el comportamiento sobre ejemplos no utilizados en el ajuste. Incorporar indebidamente información de evaluación al entrenamiento puede generar una fuga de información y resultados demasiado optimistas.

Los datos deben representar las condiciones de uso. Una muestra limitada puede ocultar fallos ante otros casos. Práctica: propone tres categorías de consultas educativas y prepara ejemplos de cada una. Explica cómo reservarías casos para una evaluación independiente.','Entrada: "No puedo entrar a mi cuenta"
Etiqueta: acceso

Entrada: "¿Qué significa una variable?"
Etiqueta: contenido académico','No evalúes solamente con los ejemplos usados para ajustar el modelo.'),
 ('introduccion-ia','uso-responsable','ia-generativa-y-contexto','IA generativa y contexto',1,20,'Distingue contextualizar una respuesta de entrenar un modelo.','Un modelo de lenguaje genera texto condicionado por los mensajes que recibe. Un prompt puede establecer una tarea, un estilo y límites. El contexto aporta información específica para orientar una respuesta, como el contenido de una lección.

Recuperar información y añadirla a una consulta no equivale a entrenar nuevamente el modelo. En AulaIA, el servidor recupera la lección seleccionada y parte del historial reciente antes de consultar al proveedor.

El contexto no garantiza exactitud. Ante información insuficiente, una respuesta adecuada reconoce la limitación y solicita una aclaración. Las instrucciones adversarias deben tratarse como datos, no como una autorización para cambiar las reglas. Práctica: define el contexto mínimo que necesita un tutor para explicar una lección sin inventar detalles.','Tarea: explicar un concepto de la lección.
Contexto: título y contenido académico disponible.
Pregunta: una duda concreta.
Límite: reconocer cuándo falta información.','Contextualizar una consulta y entrenar un modelo son procesos diferentes.'),
 ('introduccion-ia','uso-responsable','evaluacion-y-limites','Evaluación y límites de la IA',2,25,'Define criterios y registra límites antes de presentar resultados.','Una evaluación establece qué se quiere comprobar, con qué casos y mediante qué criterios. En un asistente pueden observarse pertinencia, claridad, corrección, reconocimiento de información insuficiente, duración y consumo. Cada indicador necesita una definición y un denominador claros.

Una muestra pequeña de desarrollo permite descubrir problemas, pero no demuestra satisfacción general ni mejora del aprendizaje. Las valoraciones de cuentas de prueba verifican un mecanismo y no sustituyen una investigación con estudiantes.

Conserva los casos fallidos y distingue resultados observados de capacidades todavía no evaluadas. Práctica: diseña cinco casos de tutoría, incluyendo una duda conceptual, un ejemplo, información insuficiente, una consulta fuera de tema y una instrucción adversaria. Define el resultado aceptable de cada uno.','Caso: pregunta ajena a la lección.
Criterio: reconocer el límite y orientar al contenido.
Registro: respuesta, duración y observación.
Conclusión: limitada a los casos evaluados.','Una prueba aprobada es evidencia de ese caso, no una garantía universal.')
on conflict(course_slug,slug) do nothing;

insert into public.assessments(id,course_slug,title,description,passing_score,is_published) values
 ('ea100000-0000-4000-8000-000000000002','analisis-datos','Datos, fórmulas y consultas SQL','Repasa los conceptos y ejercicios del curso.',12,true),
 ('ea100000-0000-4000-8000-000000000003','ingles-profesional','Comunicación profesional en inglés','Repasa los conceptos y ejercicios del curso.',12,true),
 ('ea100000-0000-4000-8000-000000000004','algebra-machine-learning','Vectores, matrices y modelos lineales','Repasa los conceptos y ejercicios del curso.',12,true),
 ('ea100000-0000-4000-8000-000000000005','diseno-interfaces','Interfaces claras y accesibles','Repasa los conceptos y ejercicios del curso.',12,true),
 ('ea100000-0000-4000-8000-000000000006','introduccion-ia','Conceptos y evaluación responsable de IA','Repasa los conceptos y ejercicios del curso.',12,true),
 ('ea100000-0000-4000-8000-000000000007','fundamentos-python','Decisiones y funciones en Python','Repasa los conceptos y ejercicios del curso.',12,true)
on conflict(id) do nothing;

insert into public.assessment_questions(id,assessment_id,prompt,options,position) values
 ('ea200000-0000-4000-8000-000000000021','ea100000-0000-4000-8000-000000000002','¿Qué debe representar una fila de una tabla de ventas?','["Una venta u observación","Todos los productos juntos","Solo el encabezado","Una fórmula de toda la hoja"]',1),
 ('ea200000-0000-4000-8000-000000000022','ea100000-0000-4000-8000-000000000002','¿Qué cláusula SQL filtra filas antes de agrupar?','["ORDER BY","WHERE","HAVING","LIMIT"]',2),
 ('ea200000-0000-4000-8000-000000000023','ea100000-0000-4000-8000-000000000002','¿Qué calcula COUNT(*)?','["El promedio","La suma de importes","La cantidad de registros","Solo los textos distintos"]',3),
 ('ea200000-0000-4000-8000-000000000031','ea100000-0000-4000-8000-000000000003','¿Qué frase solicita una repetición cortés?','["I will send the report.","The meeting is finished.","Could you repeat that, please?","My name is Ana."]',1),
 ('ea200000-0000-4000-8000-000000000032','ea100000-0000-4000-8000-000000000003','¿Qué conviene indicar en un seguimiento de reunión?','["Acción y responsable confirmado","Solo una opinión personal","Una decisión que nadie aprobó","Únicamente el saludo"]',2),
 ('ea200000-0000-4000-8000-000000000033','ea100000-0000-4000-8000-000000000003','¿Qué expresión introduce una petición cortés?','["Decision:","Best regards,","My name is","Could you please"]',3),
 ('ea200000-0000-4000-8000-000000000041','ea100000-0000-4000-8000-000000000004','¿Cuál es el producto punto de (2, 3) y (4, 1)?','["(8, 3)","11","10","6"]',1),
 ('ea200000-0000-4000-8000-000000000042','ea100000-0000-4000-8000-000000000004','¿Qué forma tiene la transpuesta de una matriz de 3 × 2?','["3 × 3","3 × 2","2 × 2","2 × 3"]',2),
 ('ea200000-0000-4000-8000-000000000043','ea100000-0000-4000-8000-000000000004','Si A es m × n y B es n × p, ¿qué forma tiene AB?','["m × p","n × n","p × m","m × n"]',3),
 ('ea200000-0000-4000-8000-000000000051','ea100000-0000-4000-8000-000000000005','¿Qué ayuda a reconocer la acción principal?','["Dar idéntico énfasis a todo","Eliminar las etiquetas","Usar solo imágenes","Una jerarquía visual clara"]',1),
 ('ea200000-0000-4000-8000-000000000052','ea100000-0000-4000-8000-000000000005','¿Cómo se debería comunicar un error?','["Solo con color","Con texto que explique qué revisar","Ocultando el formulario","Borrando los datos ingresados"]',2),
 ('ea200000-0000-4000-8000-000000000053','ea100000-0000-4000-8000-000000000005','¿Qué prueba básica ayuda a revisar accesibilidad?','["Recorrer la interfaz con teclado","Mirar solo la versión de escritorio","Desactivar las etiquetas","Usar siempre tres columnas"]',3),
 ('ea200000-0000-4000-8000-000000000061','ea100000-0000-4000-8000-000000000006','¿Qué utiliza el aprendizaje supervisado?','["Solo instrucciones sin datos","Ejemplos con una salida conocida","Datos de evaluación para entrenar siempre","Solo un modelo generativo"]',1),
 ('ea200000-0000-4000-8000-000000000062','ea100000-0000-4000-8000-000000000006','¿Añadir una lección al contexto equivale a entrenar el modelo?','["Sí, siempre","Solo si la lección es corta","No, son procesos diferentes","Sí, si la respuesta es correcta"]',2),
 ('ea200000-0000-4000-8000-000000000063','ea100000-0000-4000-8000-000000000006','¿Qué permite concluir una muestra pequeña de desarrollo?','["Que nunca habrá errores","Que toda persona aprenderá más","Que la concurrencia es ilimitada","Resultados limitados a los casos evaluados"]',3),
 ('ea200000-0000-4000-8000-000000000071','ea100000-0000-4000-8000-000000000007','¿Qué operador compara igualdad en Python?','["=","=>","==","==="]',1),
 ('ea200000-0000-4000-8000-000000000072','ea100000-0000-4000-8000-000000000007','¿Qué valores recorre range(3)?','["0, 1 y 2","1, 2 y 3","0, 1, 2 y 3","Solo 3"]',2),
 ('ea200000-0000-4000-8000-000000000073','ea100000-0000-4000-8000-000000000007','¿Para qué sirve return en una función?','["Para imprimir obligatoriamente","Para devolver un resultado","Para repetir un ciclo","Para declarar variables globales"]',3)
on conflict(id) do nothing;

insert into aulaia_private.assessment_answer_keys(question_id,correct_option) values
 ('ea200000-0000-4000-8000-000000000021',0),
 ('ea200000-0000-4000-8000-000000000022',1),
 ('ea200000-0000-4000-8000-000000000023',2),
 ('ea200000-0000-4000-8000-000000000031',2),
 ('ea200000-0000-4000-8000-000000000032',0),
 ('ea200000-0000-4000-8000-000000000033',3),
 ('ea200000-0000-4000-8000-000000000041',1),
 ('ea200000-0000-4000-8000-000000000042',3),
 ('ea200000-0000-4000-8000-000000000043',0),
 ('ea200000-0000-4000-8000-000000000051',3),
 ('ea200000-0000-4000-8000-000000000052',1),
 ('ea200000-0000-4000-8000-000000000053',0),
 ('ea200000-0000-4000-8000-000000000061',1),
 ('ea200000-0000-4000-8000-000000000062',2),
 ('ea200000-0000-4000-8000-000000000063',3),
 ('ea200000-0000-4000-8000-000000000071',2),
 ('ea200000-0000-4000-8000-000000000072',0),
 ('ea200000-0000-4000-8000-000000000073',1)
on conflict(question_id) do nothing;
