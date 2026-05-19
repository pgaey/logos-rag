# phase-02 Search + Prompt Evaluation Report

- **timestamp**: 2026-05-19T13:13:00.129Z
- **embedded_range**: Genesis 1~34 (1,000 / 31,102 verses)
- **policy**: quantitative 의 expected 는 적재 범위 안에서만. qualitative_ko 는 out-of-range — 사람 판단 정성 검증

## KO Hit Rate 요약

| 항목 | 값 |
|------|-----|
| PASS (HIT + EXACT) | 5 / 5 |
| Hit Rate | 100% |
| 기준 | ≥ 60% |
| 판정 | ✅ PASS |

## KO 상세 결과

### [✓ EXACT] 태초에 하나님이 천지를 창조하셨다

- **expected**: Genesis 1:1
- **note**: 한→영 cross-lingual — Genesis 1:1 top-1 기대

| rank | book | ch | v | similarity | text (앞 60자) |
|------|------|----|---|------------|---------------|
| 1 | Genesis | 1 | 1 | 0.746 | In the beginning God created the heavens and the earth. |
| 2 | Genesis | 2 | 4 | 0.694 | This is the history of the generations of the heavens and of |
| 3 | Genesis | 2 | 1 | 0.677 | The heavens and the earth were finished, and all the host of |
| 4 | Genesis | 1 | 5 | 0.672 | God called the light Day, and the darkness he called Night.  |
| 5 | Genesis | 1 | 9 | 0.669 | God said, "Let the waters under the sky be gathered together |

**조립된 프롬프트 (앞 300자)**:
```
[System]
You are a biblical assistant. Answer the user's question in Korean.
Base your answer on the provided Bible verses and cite them in your response using the format [Book Ch:V].
If the provided verses are insufficient, acknowledge it honestly.

[Relevant Bible Verses]
1. [Genesis 1:1] In the b
...(생략)
```

### [✓ EXACT] 가인이 들에서 동생 아벨을 죽였다

- **expected**: Genesis 4:8
- **note**: 한국어 paraphrase

| rank | book | ch | v | similarity | text (앞 60자) |
|------|------|----|---|------------|---------------|
| 1 | Genesis | 4 | 8 | 0.817 | Cain said to Abel, his brother, "Let`s go into the field." I |
| 2 | Genesis | 4 | 2 | 0.770 | Again she gave birth, to Cain`s brother Abel. Abel was a kee |
| 3 | Genesis | 4 | 10 | 0.738 | Yahweh said, "What have you done? The voice of your brother` |
| 4 | Genesis | 4 | 11 | 0.732 | Now you are cursed because of the ground, which has opened i |
| 5 | Genesis | 4 | 9 | 0.720 | Yahweh said to Cain, "Where is Abel, your brother?"     He s |

**조립된 프롬프트 (앞 300자)**:
```
[System]
You are a biblical assistant. Answer the user's question in Korean.
Base your answer on the provided Bible verses and cite them in your response using the format [Book Ch:V].
If the provided verses are insufficient, acknowledge it honestly.

[Relevant Bible Verses]
1. [Genesis 4:8] Cain sai
...(생략)
```

### [✓ HIT] 노아의 방주와 대홍수

- **expected**: Genesis 7:11
- **note**: Noah/flood — 6~9장 어디든 PASS

| rank | book | ch | v | similarity | text (앞 60자) |
|------|------|----|---|------------|---------------|
| 1 | Genesis | 7 | 7 | 0.697 | Noah went into the ark with his sons, his wife, and his sons |
| 2 | Genesis | 9 | 28 | 0.691 | Noah lived three hundred fifty years after the flood. |
| 3 | Genesis | 7 | 23 | 0.690 | Every living thing was destroyed that was on the surface of  |
| 4 | Genesis | 7 | 6 | 0.684 | Noah was six hundred years old when the flood of waters came |
| 5 | Genesis | 5 | 32 | 0.682 | Noah was five hundred years old, and Noah became the father  |

**조립된 프롬프트 (앞 300자)**:
```
[System]
You are a biblical assistant. Answer the user's question in Korean.
Base your answer on the provided Bible verses and cite them in your response using the format [Book Ch:V].
If the provided verses are insufficient, acknowledge it honestly.

[Relevant Bible Verses]
1. [Genesis 7:7] Noah wen
...(생략)
```

### [✓ EXACT] 야곱이 사다리 꿈을 꾸었다

- **expected**: Genesis 28:12
- **note**: Jacob ladder — 28:10~17 hit 면 PASS

| rank | book | ch | v | similarity | text (앞 60자) |
|------|------|----|---|------------|---------------|
| 1 | Genesis | 28 | 12 | 0.812 | He dreamed. Behold, a ladder set up on the earth, and the to |
| 2 | Genesis | 31 | 11 | 0.755 | The angel of God said to me in the dream, `Jacob,` and I sai |
| 3 | Genesis | 32 | 1 | 0.715 | Jacob went on his way, and the angels of God met him. |
| 4 | Genesis | 46 | 2 | 0.705 | God spoke to Israel in the visions of the night, and said, " |
| 5 | Genesis | 28 | 16 | 0.695 | Jacob awakened out of his sleep, and he said, "Surely Yahweh |

**조립된 프롬프트 (앞 300자)**:
```
[System]
You are a biblical assistant. Answer the user's question in Korean.
Base your answer on the provided Bible verses and cite them in your response using the format [Book Ch:V].
If the provided verses are insufficient, acknowledge it honestly.

[Relevant Bible Verses]
1. [Genesis 28:12] He dre
...(생략)
```

### [✓ HIT] 아브라함이 이삭을 제물로 바치려 했다

- **expected**: Genesis 22:9
- **note**: 한국어 Isaac binding — 22:1~14 hit 면 PASS

| rank | book | ch | v | similarity | text (앞 60자) |
|------|------|----|---|------------|---------------|
| 1 | Genesis | 22 | 10 | 0.791 | Abraham stretched forth his hand, and took the knife to kill |
| 2 | Genesis | 22 | 2 | 0.784 | He said, "Now take your son, your only son, whom you love, e |
| 3 | Genesis | 22 | 9 | 0.767 | They came to the place which God had told him of. Abraham bu |
| 4 | Genesis | 22 | 13 | 0.765 | Abraham lifted up his eyes, and looked, and saw that behind  |
| 5 | Genesis | 22 | 6 | 0.759 | Abraham took the wood of the burnt offering and laid it on I |

**조립된 프롬프트 (앞 300자)**:
```
[System]
You are a biblical assistant. Answer the user's question in Korean.
Base your answer on the provided Bible verses and cite them in your response using the format [Book Ch:V].
If the provided verses are insufficient, acknowledge it honestly.

[Relevant Bible Verses]
1. [Genesis 22:10] Abraha
...(생략)
```
