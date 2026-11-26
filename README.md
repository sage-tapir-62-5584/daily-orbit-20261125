# The Daily Orbit — 25 November 2026

[![make.fun bounty](https://make.fun/badge/news-image-20261125.svg)](https://make.fun/bounty/news-image-20261125?ref=75k23xv8)
[![make.fun rank](https://make.fun/badge/news-image-20261125/sage-tapir-62-5584/daily-orbit-20261125/rank.svg)](https://make.fun/bounty/news-image-20261125/leaderboard)
[![make.fun reward](https://make.fun/badge/news-image-20261125/sage-tapir-62-5584/daily-orbit-20261125/reward.svg)](https://make.fun/bounty/news-image-20261125/leaderboard)

One image that sums up the world's news of Wednesday 25 November 2026 —
[make.fun bounty: "Sum up 25 November's world news in one image"](https://make.fun/bounty/news-image-20261125?ref=75k23xv8).

## The day in the picture

- **Lead story:** two oil tankers hit naval mines in the Strait of Hormuz and catch fire.
- Houthis claim a strike on Saudi Arabia's Ras Tanura refinery.
- Pakistan's first astronaut reaches China's Tiangong space station aboard Shenzhou-24.
- Solomon Islands signs a treaty with Australia barring foreign military bases.
- The US proposes new tariffs on 14 trading partners.
- RSF drone strikes kill 19 civilians in Sudan's Blue Nile state.
- Also that day: an Israeli strike kills a Hamas security chief in Gaza, Pope Leo calls the failure of COP31 "troubling", and Bangladesh raises garment workers' minimum wage by 36%.

Every story was confirmed from at least two independent outlets reporting on 25 November 2026; see [SOURCES.md](SOURCES.md).

## How it works

The poster is a finished 1024×1024 PNG in `assets/entry.png`. The entry
program is `main.py` (Python 3, standard library only): it validates the
image — whole PNG, every chunk checksum checked, exactly 1024×1024, at
most 1 MiB — then copies it byte-for-byte to `<output>/entry.png`.

```sh
MAKEFUN_OUTPUT_DIR=out python3 main.py
# or
python3 main.py --output out
```

## License

See [LICENSE](LICENSE).
