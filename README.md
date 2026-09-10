# 18bit-color-wheel-picker

A 18 Bit (6 bit per color) color wheel and picker. I saw nobody had made a wheel+picker for 18 Bit displays (also known as 6Bit+FRC, common in ~$100 displays, and in older cheap displays that are still around)

It allows you to look at the full 262,144 color spectrum, and choose any color from it.

Available colors can be derived as the multiples of decimal 4, hex 0/00/4/8/C/FF, or 

"Native 6-bit levels in an 8-bit space = 0, 4, 8, 12, 16, 20… 248, 252

When an 8-bit value isn't a multiple of 4, the panel's timing controller (TCON) has to fake it across multiple refresh frames:

Remainder 0 (...00 binary): Native. No flickering. (0% FRC)
Remainder 1 (...01 binary): Alternates 1 frame high, 3 frames low (25% duty cycle).
Remainder 2 (...10 binary): Alternates 1 frame high, 1 frame low (50% duty cycle / maximum oscillation frequency).
Remainder 3 (...11 binary): Alternates 3 frames high, 1 frame low (75% duty cycle)."

00 and FF in particular are safe because they clamp to the darkest and brightest hardware levels, respectively.
