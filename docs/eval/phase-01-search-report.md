# phase-01 Search Evaluation Report

- **timestamp**: 2026-05-18T13:51:19.417Z
- **embedded_range**: Genesis 1~34 (1,000 / 31,102 verses)
- **policy**: quantitative 의 expected 는 적재 범위 안에서만. qualitative_ko 는 out-of-range — 사람 판단 정성 검증

## 정량 Hit Rate 요약

| 언어 | PASS | 전체 | Hit Rate |
|------|------|------|----------|
| EN | 5 | 5 | 100% |
| KO | 5 | 5 | 100% |
| 합산 | 10 | 10 | 100% |

## 정량 EN 상세

### [✓ EXACT] In the beginning God created the heavens and the earth

- **expected**: Genesis 1:1
- **note**: 거의 그대로 인용 — top-1 hit 기대

| rank | book | ch | v | similarity | text (앞 60자) |
|------|------|----|---|------------|---------------|
| 1 | Genesis | 1 | 1 | 0.986 | In the beginning God created the heavens and the earth. |
| 2 | Genesis | 2 | 4 | 0.776 | This is the history of the generations of the heavens and of |
| 3 | Genesis | 2 | 1 | 0.729 | The heavens and the earth were finished, and all the host of |
| 4 | Genesis | 1 | 2 | 0.711 | Now the earth was formless and empty. Darkness was on the su |
| 5 | Genesis | 1 | 5 | 0.710 | God called the light Day, and the darkness he called Night.  |

### [✓ EXACT] Cain killed his brother Abel in the field

- **expected**: Genesis 4:8
- **note**: 사건 paraphrase

| rank | book | ch | v | similarity | text (앞 60자) |
|------|------|----|---|------------|---------------|
| 1 | Genesis | 4 | 8 | 0.880 | Cain said to Abel, his brother, "Let`s go into the field." I |
| 2 | Genesis | 4 | 2 | 0.787 | Again she gave birth, to Cain`s brother Abel. Abel was a kee |
| 3 | Genesis | 4 | 11 | 0.748 | Now you are cursed because of the ground, which has opened i |
| 4 | Genesis | 4 | 10 | 0.732 | Yahweh said, "What have you done? The voice of your brother` |
| 5 | Genesis | 4 | 9 | 0.727 | Yahweh said to Cain, "Where is Abel, your brother?"     He s |

### [✓ HIT] Noah built an ark and the great flood covered the earth

- **expected**: Genesis 7:11
- **note**: 이야기 요약 — 7:11~24 어디든 hit 면 PASS

| rank | book | ch | v | similarity | text (앞 60자) |
|------|------|----|---|------------|---------------|
| 1 | Genesis | 7 | 19 | 0.771 | The waters prevailed exceedingly on the earth. All the high  |
| 2 | Genesis | 7 | 18 | 0.753 | The waters prevailed, and increased greatly on the earth; an |
| 3 | Genesis | 7 | 20 | 0.744 | The waters prevailed fifteen cubits upward, and the mountain |
| 4 | Genesis | 7 | 7 | 0.742 | Noah went into the ark with his sons, his wife, and his sons |
| 5 | Genesis | 7 | 6 | 0.740 | Noah was six hundred years old when the flood of waters came |

### [✓ HIT] the people built a tower to reach heaven and God confused their language

- **expected**: Genesis 11:4
- **note**: Babel — 11:4~9 hit 면 PASS

| rank | book | ch | v | similarity | text (앞 60자) |
|------|------|----|---|------------|---------------|
| 1 | Genesis | 11 | 7 | 0.828 | Come, let`s go down, and there confuse their language, that  |
| 2 | Genesis | 11 | 9 | 0.773 | Therefore the name of it was called Babel, because Yahweh co |
| 3 | Genesis | 11 | 5 | 0.761 | Yahweh came down to see the city and the tower, which the ch |
| 4 | Genesis | 11 | 1 | 0.758 | The whole earth was of one language and of one speech. |
| 5 | Genesis | 11 | 8 | 0.752 | So Yahweh scattered them abroad from there on the surface of |

### [✓ EXACT] Abraham was about to sacrifice his son Isaac on the altar

- **expected**: Genesis 22:9
- **note**: Isaac binding — 22:1~14 hit 면 PASS

| rank | book | ch | v | similarity | text (앞 60자) |
|------|------|----|---|------------|---------------|
| 1 | Genesis | 22 | 9 | 0.796 | They came to the place which God had told him of. Abraham bu |
| 2 | Genesis | 22 | 10 | 0.783 | Abraham stretched forth his hand, and took the knife to kill |
| 3 | Genesis | 22 | 6 | 0.771 | Abraham took the wood of the burnt offering and laid it on I |
| 4 | Genesis | 22 | 2 | 0.756 | He said, "Now take your son, your only son, whom you love, e |
| 5 | Genesis | 22 | 8 | 0.743 | Abraham said, "God will provide himself the lamb for a burnt |

## 정량 KO 상세

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

### [✓ EXACT] 야곱이 사다리 꿈을 꾸었다

- **expected**: Genesis 28:12
- **note**: Jacob ladder — 28:10~17 hit 면 PASS

| rank | book | ch | v | similarity | text (앞 60자) |
|------|------|----|---|------------|---------------|
| 1 | Genesis | 28 | 12 | 0.812 | He dreamed. Behold, a ladder set up on the earth, and the to |
| 2 | Genesis | 31 | 11 | 0.755 | The angel of God said to me in the dream, `Jacob,` and I sai |
| 3 | Genesis | 32 | 1 | 0.715 | Jacob went on his way, and the angels of God met him. |
| 4 | Genesis | 28 | 16 | 0.695 | Jacob awakened out of his sleep, and he said, "Surely Yahweh |
| 5 | Genesis | 31 | 45 | 0.686 | Jacob took a stone, and set it up for a pillar. |

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

## 정성 KO (사람 판단 필요)

> 아래 쿼리는 적재 범위(Genesis 1~34) 밖에서 가져온 out-of-range 쿼리입니다.
> 결과가 나오더라도 정확도 판단은 사람이 해야 합니다.

### 사랑은 오래 참고 온유하다

> 1 Corinthians 13 — out-of-range. Genesis 안에서 사랑/관계 관련 verse 가 나오는지 사람 판단

| rank | book | ch | v | similarity | text |
|------|------|----|---|------------|------|
| 1 | Genesis | 29 | 20 | 0.600 | Jacob served seven years for Rachel. They seemed to him but a few days, for the love he had for her. |
| 2 | Genesis | 29 | 30 | 0.569 | He went in also to Rachel, and he loved also Rachel more than Leah, and served with him yet seven other years. |
| 3 | Genesis | 34 | 3 | 0.568 | His soul joined to Dinah, the daughter of Jacob, and he loved the young lady, and spoke kindly to the young lady. |

### 여호와는 나의 목자시니 내게 부족함이 없으리로다

> Psalm 23 — out-of-range. Genesis 안에서 목자/인도 관련 verse (e.g. 야곱이 양치는 장면) 가 나오는지

| rank | book | ch | v | similarity | text |
|------|------|----|---|------------|------|
| 1 | Genesis | 28 | 21 | 0.611 | so that I come again to my father`s house in peace, and Yahweh will be my God, |
| 2 | Genesis | 28 | 20 | 0.606 | Jacob vowed a vow, saying, "If God will be with me, and will keep me in this way that I go, and will give me bread to eat, and clothing to put on, |
| 3 | Genesis | 30 | 31 | 0.602 | He said, "What shall I give you?"     Jacob said, "You shall not give me anything. If you will do this thing for me, I will again feed your flock and keep it. |

### 선한 사마리아인의 비유

> Luke 10 — out-of-range. Genesis 안에서 자비/도움 관련 verse 가 나오는지 (없어도 정상 — out-of-distribution)

| rank | book | ch | v | similarity | text |
|------|------|----|---|------------|------|
| 1 | Genesis | 21 | 19 | 0.580 | God opened her eyes, and she saw a well of water. She went, filled the bottle with water, and gave the boy drink. |
| 2 | Genesis | 22 | 5 | 0.568 | Abraham said to his young men, "Stay here with the donkey. The boy and I will go yonder. We will worship, and come back to you. |
| 3 | Genesis | 19 | 2 | 0.565 | and he said, "See now, my lords, please turn aside into your servant`s house, stay all night, wash your feet, and you will rise up early, and go on your way."     They said, "No, but we will stay in the street all night." |
