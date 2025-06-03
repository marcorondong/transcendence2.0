# Pong Coordinates

## Real table size

Official pong table is 9 (feet) long, 5 (feet) wide.

## Game coordinates (x), (y)

x = 0, y = 0 will be center of pong table.

* Left Up corner => (-4.5), (2.5)
* Left Down corner => (-4.5), (-2.5)
* Right Up corner => (4.5), (2.5)
* Right Down corner => (4.5), (-2.5)
* Left Paddle => (-4.0), (0)
* Right Paddle => (4.0), (0)

## Sizes (x width, y height)

* Paddle size => (x: 0.2, y: 1.0)
* Ball size => (0.075) diameter of circle

## Vector enum direction explanation

|x value| direction|
|-------|----------|
| 00    | N        |
| 01    | Right    |
| 10    | Left     |

| y value | direction |
|---------|-----------|
| 00      | N         |
| 01      | Up        |
| 10      | Down      |

| x  | y  | direction  | value |
|----|----|------------|-------|
| 00 | 00 | N          | 0     |
| 00 | 01 | UP         | 1     |
| 00 | 10 | DOWN       | 2     |
| 00 | 11 | IMPOSSIBLE | 3     |
| 01 | 00 | RIGHT      | 4     |
| 01 | 01 | RIGHT_UP   | 5     |
| 01 | 10 | RIGHT_DOWN | 6     |
| 01 | 11 | IMPOSSIBLE | 7     |
| 10 | 00 | LEFT       | 8     |
| 10 | 01 | LEFT_UP    | 9     |
| 10 | 10 | LEFT_DOWN  | 10    |

## svg file

x and y on edges are switched...Stupid filip

![svg file with dimensions](/microservices/ssg/pong-api/Pong_dimensions.svg)
