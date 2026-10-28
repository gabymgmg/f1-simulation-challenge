# Key prompts

The prompts that shaped the project, copied as written (in Spanish). Each one fixes decisions first and then asks for a small, testable piece.

## 1. Context and setup

Sets the model, the rules, the endpoints and the error codes before writing any code.

```text
## Prompt 1 — Contexto inicial y setup

**Contexto:**
Estoy haciendo un challenge técnico (2-3 h): una app fullstack donde el usuario
elige una carrera de F1, ve la info de carrera/circuito/neumáticos, arma una
estrategia de neumáticos, corre una simulación y entiende el resultado.
El back consume una API externa (https://tech-challenge101.onrender.com,
Swagger en /docs) y corre la simulación. Después hay una entrevista sobre mi código.

**Decisiones mías (ya tomadas):**
- Stack: React + Vite en /client, Express en /server, tests con Vitest.
- Todo el código y las claves JSON en inglés.
- Modelo mínimo: tiempo por vuelta = baseLapTime (circuito) + pace del compuesto
  + degradation × edad del stint. La edad es 0 en la primera vuelta del stint
  (goma nueva) y se reinicia al parar.
  Cada parada suma pitStopLoss + tyreChangeTime (de simulation-parameters).
- Regla de precedencia: si un dato está en varias fuentes, gana el más
  específico (simulation-parameters > race > circuit). laps sale de race.
- El usuario arma stints (compuesto + vueltas que dura). Las paradas se
  derivan: N stints = N-1 paradas.
- Validaciones: cada stint ≥ 1 vuelta, compuesto válido, suma de vueltas =
  race laps, paradas ≥ minimumPitStops, al menos dos compuestos distintos
  (regla mía). Se valida en front y en back.
- Endpoints de mi back: GET /api/races, GET /api/races/:raceId,
  GET /api/tyres, POST /api/simulation con body
  { raceId, stints: [{ compound, laps }] }.
- Errores: 400 body mal formado, 404 carrera inexistente, 422 estrategia
  inválida, 500 error propio, 503 la API falla o devuelve vacío, 504 timeout.
- Resultado: tabla con stint, compuesto, vueltas, tiempo del stint y parada al
  final del stint que termina, más el total (incluye paradas).
- Fuera de esta versión: drivers, teams, clima, combustible, safety car,
  varianza, base de datos.
- Próximos incrementos: comparar contra la simulación anterior (estado del
  front) y barra visual de stints.

**Tarea:**
Armar el setup del repo: /client con Vite + React, /server con Express,
Vitest configurado en ambos, y un endpoint GET /api/health para probar.

**Restricciones:**
- Código de junior que entiende el problema: nombres claros, funciones chicas,
  sin abstracciones que no necesito.
- TDD solo en validación y simulación (funciones puras). Sin tests de
  integración ni de UI por tiempo.
- La validación y la simulación las escribo yo: ahí quiero pistas, no soluciones.
- Commits cortos y descriptivos con prefijo (feat:, test:, chore:...).

**Quiero recibir:**
Los pasos y comandos del setup y el código mínimo del server, explicado
brevemente para poder justificarlo en la entrevista.
```

## 2. Strategy validation (TDD)

Turns the business rules into a pure function that returns every error, test first.

```text
Validacion de la estrategia. Decision mia: delegar validacion ya que las reglas estan definidas. Devuelve una lista con los errores para que el usuario pueda corregir de acuerdo al error. Reglas de validacion: - Cada stint tiene al menos 1 vuelta.
- Cada compuesto existe en la lista de tyres de la API.
- La suma de las vueltas de los stints es exactamente igual a race.laps.
- Cantidad de paradas (stints - 1) >= minimumPitStops.
- Al menos dos compuestos distintos - Suposicion tomado desde el inicio.
- Entrada: la estrategia { raceId, stints: [{ compound, laps }] }, las vueltas
de la carrera, la lista de compuestos válidos y minimumPitStops.
Tarea: con TDD, escribe los tests y despues la funcion de validacion en server/src, separada de express.
_ Restricciones: funcion pura, fixtures sin mocks, codigo simple y legible. Un commit test: y uno feat: por regla
- Salida: tests primero y despues implementacion con una linea explicando la regla
```

## 3. F1 API client and error translation

Defines how external failures become my own status codes, so the UI can tell "user error" from "service down".

```text
Decisiones tomadas a tomar en cuenta: backend no confia en datos del front end pide race, tyres y simulation-parameters a la API de F1. Los errores de la API se traducen a mis
códigos anexados para que el front distinga "error del usuario" de "servicio caído". Tarea: en server/src, un módulo f1Client.js con funciones:
getRaces(), getRace(raceId), getTyres(), getSimulationParameters(raceId).
- Base URL: https://tech-challenge101.onrender.com
- Todas las respuestas vienen envueltas en { statusCode, code, message, data }, de igual forma verificar ya que este es un patron para la mayoria. desenvolver data en un solo lugar (una función fetchFromF1).
- Traducción de errores (lanzar un error con status):
  - la API responde 404 → 404
  - la API responde otro error, o data viene vacía → 503
  - la API no responde a tiempo → 504 (timeout con AbortController,
   70 s porque el free tier tarda hasta un minuto en despertar). Restricciones: código simple de junior, sin librerías extra (fetch nativo). No tomar decisiones sin consultar. No commitear sin consultar.
Tests unitarios mockeando fetch (vi.fn / vi.stubGlobal) solo para la traducción
de errores: 404, 500 → 503, data vacía → 503, timeout → 504, y un caso OK que
desenvuelve data. Sin tests de integración. Revisá en el Swagger la forma
exacta de data de cada endpoint.
Salida: tests primero, después la implementación, y commits
test:/feat: chicos.
```

## 4. Routes and the simulation endpoint

Wires the tested pieces together: validate the body, fetch the data, apply the rules, then simulate.

```text
Decisiones tomadas a tomar en cuenta: el POST valida antes de simular, y cada tipo de error tiene su código: 400 body mal formado, 404 carrera inexistente, 422 estrategia
inválida (devuelve la lista completa de errores), 500 error propio,
503/504 de la API. Tarea: en server/src, rutas de Express usando f1Client, validateStrategy y simulateRace (ya existen y tienen tests):
- GET /api/races
- GET /api/races/:raceId (carrera con su circuito embebido)
- GET /api/tyres
- POST /api/simulation con body { raceId, stints: [{ compound, laps }] }:
  1. Chequear forma del body → 400 si falta raceId o stints no es array.
  2. Pedir race, tyres y simulation-parameters (en paralelo).
  3. validateStrategy con race.laps, compuestos de tyres y minimumPitStops
     → 422 con { errors: [...] } si hay errores.
  4. simulateRace con baseLapTime del circuito, pitStopLoss y tyreChangeTime
     de simulation-parameters (regla: el dato más específico gana).
  5. 200 con el resultado.
- Un middleware de errores que use el status del error (o 500) y devuelva
  { message }. Restrcciones: sin tests de endpoints (decidí no hacer integración).
Código simple, rutas en un archivo, sin capas extra. Proxy de Vite de /api al server para evitar CORS.
Salida: el código y una línea por cada paso del POST.
```

## 5. Frontend

Defines the user flow: build stints with a laps-remaining counter, simulate only when the strategy covers the race, and read the result as a breakdown.

```text
Deciones tomadas a tomar en cuenta: el usuario arma stints (compuesto + vueltas), no paradas.
Un contador de vueltas restantes le muestra si la estrategia cubre la carrera antes de simular. El resultado es una tabla, porque el desglose importa más que el total. Tarea: en /client con React (sin librerías de UI):
1. Selector de carrera (GET /api/races).
2. Info de la carrera elegida: nombre y fecha; circuito, país, longitud;
   tabla de neumáticos con pace y degradation (GET /api/races/:id y
   GET /api/tyres, tyres se pide una sola vez).
3. Armado de estrategia: botón "Add stint", cada fila con select de
   compuesto + input de vueltas + botón quitar. Contador "laps remaining".
   El botón Simulate se habilita solo si las vueltas suman exactamente
   las de la carrera.
4. Resultado: tabla con stint, compound, laps, stint time, pit stop
   (en el stint que termina; "—" en el último). Abajo: total pit stop
   time y total race time. Tiempos en formato h:mm:ss.s.
5. Errores: 422 → lista de errores de la estrategia; 503/504 → "The data
   service is waking up or unavailable, try again in a few seconds";
   404 → "Race not found". Estado de carga mientras espera.
componentes simples (App, RaceInfo, StrategyBuilder,
ResultTable), useState/useEffect, sin estado global ni librerías extra.
Estilos mínimos y legibles. Sin tests de UI. Salida: código por componente y una línea de qué hace cada uno. recuerda codigo de jr sin sobreingenieria
```
