// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "About",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-people",
          title: "People",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/people/";
          },
        },{id: "nav-photos",
          title: "📸Photos",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/photos/";
          },
        },{id: "nav-blog",
          title: "Blog",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "nav-publications",
          title: "Publications",
          description: "Research publications and academic works.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-projects",
          title: "Projects",
          description: "A showcase of BAELAB&#39;s innovative projects.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "nav-cv",
          title: "CV",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "post-queuing-based-operational-indicators-for-explaining-and-predicting-port-operations",
        
          title: "Queuing-Based Operational Indicators For Explaining and Predicting Port Operations",
        
        description: "Queuing-Based Operational Indicators For Explaining and Predicting Port Operations",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/QueuingIndicators/";
          
        },
      },{id: "post-ct-forecasting-with-time-llm",
        
          title: "CT forecasting with Time-LLM",
        
        description: "CT forecasting with TimeLLM",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/TimeLLMCTF/";
          
        },
      },{id: "post-bitnet-톺아보기",
        
          title: "Bitnet 톺아보기.",
        
        description: "Bitnet 톺아보기.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/BitNet/";
          
        },
      },{id: "post-post-llm-online-function-approximation-problem은-어떻게-해결할-수있는가-rnn에서-mamba2까지",
        
          title: "Post LLM, Online Function Approximation problem은 어떻게 해결할 수있는가? RNN에서 Mamba2까지",
        
        description: "맘바에 대해서 알아보자",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/Mamba/";
          
        },
      },{id: "post-an-evolutionary-and-predictive-discrete-event-simulation",
        
          title: "An Evolutionary and Predictive Discrete Event Simulation",
        
        description: "컨테이너 터미널 효율을 높이기 위한 GAIML 기법",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2024/KikunPark/";
          
        },
      },{id: "post-a-post-with-formatting-and-links",
        
          title: "a post with formatting and links",
        
        description: "march &amp; april, looking forward to summer",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2015/Points/";
          
        },
      },{id: "books-the-godfather",
          title: 'The Godfather',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/the_godfather/";
            },},{id: "news-부산대-배혜림-교수-김승-씨-39-icicic-2011-39-논문상-수상",
          title: '부산대 배혜림 교수·김승 씨, &amp;#39;ICICIC 2011&amp;#39; 논문상 수상',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/ICICIC2012/";
            },},{id: "news-시계열-예측을-위한-새로운-인공신경망-cru-부산대-저명-학술지-ieee-tpami-논문-게재",
          title: '시계열 예측을 위한 새로운 인공신경망 CRU 부산대, 저명 학술지 『IEEE TPAMI』 논문 게재...',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/%EC%8B%9C%EA%B3%84%EC%97%B4%20%EC%98%88%EC%B8%A1%EC%9D%84%20%EC%9C%84%ED%95%9C%20%EC%83%88%EB%A1%9C%EC%9A%B4%20%EC%9D%B8%EA%B3%B5%EC%8B%A0%EA%B2%BD%EB%A7%9D%20CRU%20%EB%B6%80%EC%82%B0%EB%8C%80,%20%EC%A0%80%EB%AA%85%20%ED%95%99%EC%88%A0%EC%A7%80%20%E3%80%8EIEEE%20TPAMI%E3%80%8F%20%EB%85%BC%EB%AC%B8%20%EA%B2%8C%EC%9E%AC/";
            },},{id: "news-주제발표하는-배혜림-부산대-교수",
          title: '주제발표하는 배혜림 부산대 교수',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/%EC%A3%BC%EC%A0%9C%EB%B0%9C%ED%91%9C%ED%95%98%EB%8A%94%20%EB%B0%B0%ED%98%9C%EB%A6%BC%20%EB%B6%80%EC%82%B0%EB%8C%80%20%EA%B5%90%EC%88%98/";
            },},{id: "news-selamat-tinggal-dan-selamat-️-mingi-han-has-submitted-a-paper-to-the-journal-of-the-korean-institute-of-industrial-engineers-jkiie",
          title: 'Selamat tinggal dan selamat! 🏝️ 🌋🐚 !!! Mingi Han has submitted a paper...',
          description: "",
          section: "News",},{id: "news-informs-international-2025-invitation-with-dohee-kim-and-jaeeun-kwon",
          title: 'INFORMS International 2025 Invitation with Dohee Kim and Jaeeun Kwon',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/informs/";
            },},{id: "news-부산-데이터-위크-개최-데이터-기반-혁신도시-도약",
          title: '부산 데이터 위크 개최…“데이터 기반 혁신도시 도약”',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/%EB%B6%80%EC%82%B0%EB%8D%B0%EC%9D%B4%ED%84%B0%EC%9C%84%ED%81%AC/";
            },},{id: "news-icicic-with-sangmin-jo-and-seongmoon-hong",
          title: 'ICICIC with Sangmin Jo and Seongmoon Hong',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/2025-09-04-ICICIC2025/";
            },},{id: "news-logms-2025-with-jungho-choo-kyunghoon-lee",
          title: 'LOGMS 2025 with Jungho Choo, Kyunghoon Lee',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/2025-08-28-LOGMS2025/";
            },},{id: "news-bpm-2025-presenter-yongjae-lee",
          title: 'BPM 2025 Presenter Yongjae Lee!!',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/2025-09-04-BPM/";
            },},{id: "news-すごい-sangmin-jo-got-the-icicic2025-best-presentation-award",
          title: 'すごい!! 🎉🎉🎉    Sangmin Jo got the ICICIC2025 Best Presentation Award!!!!',
          description: "",
          section: "News",},{id: "news-제11회-39-부산-r-amp-d-주간-39-행사-25-26일-벡스코서-열려",
          title: '제11회 &amp;#39;부산 R&amp;amp;D 주간&amp;#39; 행사 25~26일 벡스코서 열려',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/2025-09-23-%EB%B6%80%EC%82%B0%EC%95%8C%EC%95%A4%EB%94%94%EC%A3%BC%EA%B0%84/";
            },},{id: "news-paper-accepted-to-advanced-engineering-informatics",
          title: 'Paper Accepted to Advanced Engineering Informatics!!!',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/2025-10-17-DSparkAdv/";
            },},{id: "news-bistep-해양산업-전략-논의-미래기술혁신포럼-23일-개최",
          title: 'BISTEP, 해양산업 전략 논의…미래기술혁신포럼 23일 개최',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/2025-10-21-BISTEP/";
            },},{id: "news-gung1-hei2-恭喜-paper-accepted-at-ieee-bigdata-2025-conference",
          title: 'Gung1 Hei2(恭喜)!!🎉🎉🎉 Paper Accepted at IEEE BigData 2025 Conference',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/2025-10-24-BigData/";
            },},{id: "news-informs-annual-meeting-2025",
          title: 'INFORMS annual meeting 2025',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/2025-10-29-informs/";
            },},{id: "news-热烈祝贺-sci-2025-with-jungho-choo-jaehyeon-heo",
          title: '热烈祝贺!!  🎉🎉🎉 SCI 2025 with Jungho Choo, Jaehyeon Heo',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/2025-11-09-SCI2025/";
            },},{id: "news-paper-accepted-to-ocean-engineering",
          title: 'Paper accepted to Ocean Engineering!',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/2025-10-17-DSparkAdv%20copy/";
            },},{id: "news-트레드링스-부산대와-ai-기반-공급망-예측-모델-공동-개발-mou-체결",
          title: '트레드링스, 부산대와 ‘AI 기반 공급망 예측 모델’ 공동 개발 MOU 체결',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/%ED%8A%B8%EB%A0%88%EB%93%9C%EB%A7%81%EC%8A%A4/";
            },},{id: "news-pusan-national-university-researchers-develop-model-to-accurately-predict-vessel-turnaround-time",
          title: 'Pusan National University researchers develop model to accurately predict vessel turnaround time',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/Pusan%20National%20University%20researchers%20develop%20model%20to%20accurately%20predict%20vessel%20turnaround%20time/";
            },},{id: "news-ai시대-동남권-미래-논의-부산서-통계-데이터-첫-공동-포럼-열려",
          title: 'AI시대 동남권 미래 논의…부산서 통계·데이터 첫 공동 포럼 열려',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/%EB%B6%80%EC%82%B0%EB%8D%B0%EC%9D%B4%ED%84%B0%EC%9C%84%ED%81%AC%20copy/";
            },},{id: "news-dr-dohee-kim-appointed-as-professor-at-changwon-national-university",
          title: 'Dr. Dohee Kim Appointed as Professor at Changwon National University',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/2025-12-01-Prof_DoheeKim/";
            },},{id: "news-2025년도-제4회-해양수산-과학기술-혁신포럼-발표",
          title: '2025년도 제4회 해양수산 과학기술 혁신포럼 발표',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/%5B2025%EB%85%84%EB%8F%84%20%EC%A0%9C4%ED%9A%8C%20%ED%95%B4%EC%96%91%EC%88%98%EC%82%B0%20%EA%B3%BC%ED%95%99%EA%B8%B0%EC%88%A0%20%ED%98%81%EC%8B%A0%ED%8F%AC%EB%9F%BC%5D%20%EB%B0%9C%ED%91%9C3%20-%20%EB%B6%80%EC%82%B0%EB%8C%80%ED%95%99%EA%B5%90%20%EB%B0%B0%ED%98%9C%EB%A6%BC%20%EA%B5%90%EC%88%98/";
            },},{id: "people-nur-ahmad-wahid",
          title: 'Nur Ahmad Wahid',
          description: "M.S. Software Engineer at Diverta Inc.",
          section: "People",handler: () => {
              window.location.href = "/people/Ahmad%20Wahid/";
            },},{id: "people-bernardo-nugroho-yahya",
          title: 'Bernardo Nugroho Yahya',
          description: "PhD. Professor at Hankuk Univ of Foreign Studies, Industrial Engineering",
          section: "People",handler: () => {
              window.location.href = "/people/BernardoNugrohoYahya/";
            },},{id: "people-iq-reviessay-pulshashi",
          title: 'Iq Reviessay Pulshashi',
          description: "PhD. Senior Research Engineer (선임) at IOChord (아이오코드)",
          section: "People",handler: () => {
              window.location.href = "/people/Iq%20Reviessay%20Pulshashi/";
            },},{id: "people-ling-liu",
          title: 'Ling Liu',
          description: "Professor",
          section: "People",handler: () => {
              window.location.href = "/people/LingLiu/";
            },},{id: "people-nur-ichsan-utama",
          title: 'Nur Ichsan Utama',
          description: "PhD. Telkom university",
          section: "People",handler: () => {
              window.location.href = "/people/Nur%20Ichsan%20Utama/";
            },},{id: "people-riska-asriana-sutrisnowati",
          title: 'Riska Asriana Sutrisnowati',
          description: "PhD. Senior Research Engineer (선임) at IOChord (아이오코드)",
          section: "People",handler: () => {
              window.location.href = "/people/Riska%20Asriana%20Sutrisnowati/";
            },},{id: "people-shuzhu-zhang",
          title: 'Shuzhu ZHANG',
          description: "M.S. Professor at Zhejiang University, School of Information Management and Artificial Intelligence",
          section: "People",handler: () => {
              window.location.href = "/people/ShuzhuZHANG/";
            },},{id: "people-taufik-nur-adi",
          title: 'Taufik Nur Adi',
          description: "PhD. Permanent Lecturer at Telkom University",
          section: "People",handler: () => {
              window.location.href = "/people/Taufik%20Adi/";
            },},{id: "people-yelita-anggiane-iskandar",
          title: 'Yelita Anggiane Iskandar',
          description: "Doctor program",
          section: "People",handler: () => {
              window.location.href = "/people/YelitaAnggianeIskandar/";
            },},{id: "people-zhenguo-wang",
          title: 'Zhenguo Wang',
          description: "Department Manager at 上海振华重工(集团)股份有限公司 (ZPMC)",
          section: "People",handler: () => {
              window.location.href = "/people/ZhenguoWang/";
            },},{id: "people-mingyun-kang-강민균",
          title: 'Mingyun Kang(강민균)',
          description: "Undergraduate Student",
          section: "People",handler: () => {
              window.location.href = "/people/%EA%B0%95%EB%AF%BC%EA%B7%A0/";
            },},{id: "people-seongpil-kang-강성필",
          title: 'Seongpil Kang(강성필)',
          description: "Doctor Program",
          section: "People",handler: () => {
              window.location.href = "/people/%EA%B0%95%EC%84%B1%ED%95%84/";
            },},{id: "people-hanseok-kang-강한석",
          title: 'Hanseok Kang(강한석)',
          description: "M.S. 주임 at 파크랜드 월드",
          section: "People",handler: () => {
              window.location.href = "/people/%EA%B0%95%ED%95%9C%EC%84%9D/";
            },},{id: "people-jaeeun-kwon-권재은",
          title: 'Jaeeun Kwon(권재은)',
          description: "Integrated PhD program",
          section: "People",handler: () => {
              window.location.href = "/people/%EA%B6%8C%EC%9E%AC%EC%9D%80/";
            },},{id: "people-hyeunho-kwun-권현호",
          title: 'Hyeunho Kwun(권현호)',
          description: "M.S. 신용보증기금",
          section: "People",handler: () => {
              window.location.href = "/people/%EA%B6%8C%ED%98%84%ED%98%B8/";
            },},{id: "people-kihun-kim-김기훈",
          title: 'Kihun Kim(김기훈)',
          description: "Professor",
          section: "People",handler: () => {
              window.location.href = "/people/%EA%B9%80%EA%B8%B0%ED%9B%88/";
            },},{id: "people-dowon-kim-김도원",
          title: 'Dowon Kim(김도원)',
          description: "Professor",
          section: "People",handler: () => {
              window.location.href = "/people/%EA%B9%80%EB%8F%84%EC%9B%90/";
            },},{id: "people-dohee-kim-김도희",
          title: 'Dohee Kim(김도희)',
          description: "PhD. Assistant Professor at Changwon National Univ, School of Artificial Intelligence Convergence Engineering",
          section: "People",handler: () => {
              window.location.href = "/people/%EA%B9%80%EB%8F%84%ED%9D%AC/";
            },},{id: "people-dongwoo-kim-김동우",
          title: 'Dongwoo Kim(김동우)',
          description: "Undergraduate Student",
          section: "People",handler: () => {
              window.location.href = "/people/%EA%B9%80%EB%8F%99%EC%9A%B0/";
            },},{id: "people-minseop-kim-김민섭",
          title: 'Minseop Kim(김민섭)',
          description: "Integrated PhD program",
          section: "People",handler: () => {
              window.location.href = "/people/%EA%B9%80%EB%AF%BC%EC%84%AD/";
            },},{id: "people-minhee-kim-김민희",
          title: 'Minhee Kim(김민희)',
          description: "M.S",
          section: "People",handler: () => {
              window.location.href = "/people/%EA%B9%80%EB%AF%BC%ED%9D%AC/";
            },},{id: "people-seonghan-kim-김성한",
          title: 'Seonghan Kim(김성한)',
          description: "M.S Program",
          section: "People",handler: () => {
              window.location.href = "/people/%EA%B9%80%EC%84%B1%ED%95%9C/";
            },},{id: "people-somyeong-kim-김소명",
          title: 'Somyeong Kim(김소명)',
          description: "Integrated PhD program",
          section: "People",handler: () => {
              window.location.href = "/people/%EA%B9%80%EC%86%8C%EB%AA%85/";
            },},{id: "people-yerin-kim-김예린",
          title: 'Yerin Kim(김예린)',
          description: "Integrated PhD program",
          section: "People",handler: () => {
              window.location.href = "/people/%EA%B9%80%EC%98%88%EB%A6%B0/";
            },},{id: "people-jongmin-kim-김종민",
          title: 'Jongmin Kim(김종민)',
          description: "Undergraduate Student",
          section: "People",handler: () => {
              window.location.href = "/people/%EA%B9%80%EC%A2%85%EB%AF%BC/";
            },},{id: "people-takhyeong-kim-김탁형",
          title: 'Takhyeong Kim(김탁형)',
          description: "M.S Program",
          section: "People",handler: () => {
              window.location.href = "/people/%EA%B9%80%ED%83%81%ED%98%95/";
            },},{id: "people-hyemee-kim-김혜미",
          title: 'Hyemee Kim(김혜미)',
          description: "Doctor Program",
          section: "People",handler: () => {
              window.location.href = "/people/%EA%B9%80%ED%98%9C%EB%AF%B8/";
            },},{id: "people-jonghyun-nam-남종현",
          title: 'Jonghyun Nam(남종현)',
          description: "Undergraduate Student",
          section: "People",handler: () => {
              window.location.href = "/people/%EB%82%A8%EC%A2%85%ED%98%84/";
            },},{id: "people-changho-moon-문창호",
          title: 'Changho Moon(문창호)',
          description: "M.S Program",
          section: "People",handler: () => {
              window.location.href = "/people/%EB%AC%B8%EC%B0%BD%ED%98%B8/";
            },},{id: "people-kikun-park-박기군",
          title: 'Kikun Park(박기군)',
          description: "PhD. Postdoctoral Researher at SCSC Research Center",
          section: "People",handler: () => {
              window.location.href = "/people/%EB%B0%95%EA%B8%B0%EA%B5%B0/";
            },},{id: "people-daesan-park-박대산",
          title: 'Daesan Park(박대산)',
          description: "M.S",
          section: "People",handler: () => {
              window.location.href = "/people/%EB%B0%95%EB%8C%80%EC%82%B0/";
            },},{id: "people-myeongsoon-park-박명순",
          title: 'Myeongsoon Park(박명순)',
          description: "M.S Program",
          section: "People",handler: () => {
              window.location.href = "/people/%EB%B0%95%EB%AA%85%EC%88%9C/";
            },},{id: "people-mingyu-park-박민규",
          title: 'Mingyu Park(박민규)',
          description: "M.S. Researcher at LIG Nex1",
          section: "People",handler: () => {
              window.location.href = "/people/%EB%B0%95%EB%AF%BC%EA%B7%9C/";
            },},{id: "people-sanghyuck-stephn-park-박상혁",
          title: 'Sanghyuck(Stephn) Park(박상혁)',
          description: "M.S. Head of Planning Department, (주)동신모텍",
          section: "People",handler: () => {
              window.location.href = "/people/%EB%B0%95%EC%83%81%ED%98%81/";
            },},{id: "people-eunhee-park-박은희",
          title: 'Eunhee Park(박은희)',
          description: "M.S",
          section: "People",handler: () => {
              window.location.href = "/people/%EB%B0%95%EC%9D%80%ED%9D%AC/";
            },},{id: "people-jaehun-park-박재훈",
          title: 'Jaehun Park(박재훈)',
          description: "PhD. Professor at Changwon National Univ, Department of Business Administration",
          section: "People",handler: () => {
              window.location.href = "/people/%EB%B0%95%EC%9E%AC%ED%9B%88/";
            },},{id: "people-junseo-park-박준서",
          title: 'Junseo Park(박준서)',
          description: "Undergraduate Student",
          section: "People",handler: () => {
              window.location.href = "/people/%EB%B0%95%EC%A4%80%EC%84%9C/";
            },},{id: "people-chanho-park-박찬호",
          title: 'Chanho Park(박찬호)',
          description: "M.S. Senier Researcher at LGCNS",
          section: "People",handler: () => {
              window.location.href = "/people/%EB%B0%95%EC%B0%AC%ED%98%B8/";
            },},{id: "people-taekhyun-park-박택현",
          title: 'Taekhyun Park (박택현)',
          description: "M.S Program",
          section: "People",handler: () => {
              window.location.href = "/people/%EB%B0%95%ED%83%9D%ED%98%84/";
            },},{id: "people-hanbyeol-park-박한별",
          title: 'Hanbyeol Park(박한별)',
          description: "Integrated PhD program",
          section: "People",handler: () => {
              window.location.href = "/people/%EB%B0%95%ED%95%9C%EB%B3%84/";
            },},{id: "people-hyerim-bae-배혜림",
          title: 'Hyerim Bae(배혜림)',
          description: "Professor",
          section: "People",handler: () => {
              window.location.href = "/people/%EB%B0%B0%ED%98%9C%EB%A6%BC/";
            },},{id: "people-hanwoong-baek-백한웅",
          title: 'Hanwoong Baek(백한웅)',
          description: "M.S Program",
          section: "People",handler: () => {
              window.location.href = "/people/%EB%B0%B1%ED%95%9C%EC%9B%85/";
            },},{id: "people-junhyuk-seo-서준혁",
          title: 'Junhyuk Seo(서준혁)',
          description: "Integrated PhD program",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%84%9C%EC%A4%80%ED%98%81/";
            },},{id: "people-sunghyun-sim-심성현",
          title: 'Sunghyun Sim(심성현)',
          description: "PhD. Professor at Changwon National Univ, School of Artificial Intelligence Convergence Engineering",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%8B%AC%EC%84%B1%ED%98%84/";
            },},{id: "people-alif-nur-iman-아리프",
          title: 'Alif Nur Iman(아리프)',
          description: "Ph.D Program",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%95%84%EB%A6%AC%ED%94%84/";
            },},{id: "people-minji-ahn-안민지",
          title: 'Minji Ahn(안민지)',
          description: "M.S Program",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%95%88%EB%AF%BC%EC%A7%80/";
            },},{id: "people-taesun-yu-유태선",
          title: 'Taesun Yu (유태선)',
          description: "Professor",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%9C%A0%ED%83%9C%EC%84%A0/";
            },},{id: "people-gawon-lee-이가원",
          title: 'Gawon Lee(이가원)',
          description: "M.S.",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%9D%B4%EA%B0%80%EC%9B%90/";
            },},{id: "people-kyunghoon-lee-이경훈",
          title: 'Kyunghoon Lee(이경훈)',
          description: "M.S Program",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%9D%B4%EA%B2%BD%ED%9B%88/";
            },},{id: "people-imam-mustafa-kamal",
          title: 'Imam Mustafa Kamal',
          description: "PhD. Professor at Institut Teknologi Sepuluh Nopember, Department of Informatics",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%9D%B4%EB%A7%98/";
            },},{id: "people-minseop-lee-이민섭",
          title: 'Minseop Lee(이민섭)',
          description: "M.S.",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%9D%B4%EB%AF%BC%EC%84%AD/";
            },},{id: "people-sangjae-lee-이상재",
          title: 'Sangjae Lee(이상재)',
          description: "M.S. LG Energy Solution",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%9D%B4%EC%83%81%EC%9E%AC/";
            },},{id: "people-yongjae-lee-이용재",
          title: 'Yongjae Lee(이용재)',
          description: "M.S. Research Assistant",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%9D%B4%EC%9A%A9%EC%9E%AC/";
            },},{id: "people-eunju-lee-이은주",
          title: 'Eunju Lee(이은주)',
          description: "M.S. Researcher at FITI",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%9D%B4%EC%9D%80%EC%A3%BC/";
            },},{id: "people-hyunju-lee-이현주",
          title: 'Hyunju Lee(이현주)',
          description: "Doctor Program",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%9D%B4%ED%98%84%EC%A3%BC/";
            },},{id: "people-hyunha-lee-이현하",
          title: 'Hyunha Lee(이현하)',
          description: "Undergraduate Student",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%9D%B4%ED%98%84%ED%95%98/";
            },},{id: "people-jinhong-lim-임진홍",
          title: 'Jinhong Lim(임진홍)',
          description: "Doctor Program",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%9E%84%EC%A7%84%ED%99%8D/";
            },},{id: "people-minsu-jeong-정민수",
          title: 'Minsu Jeong(정민수)',
          description: "M.S Program",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%A0%95%EB%AF%BC%EC%88%98/";
            },},{id: "people-minjae-jeong-정민재",
          title: 'MinJae Jeong(정민재)',
          description: "Undergraduate Student",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%A0%95%EB%AF%BC%EC%9E%AC/";
            },},{id: "people-jaeyoung-jeong-정재영",
          title: 'Jaeyoung Jeong(정재영)',
          description: "Undergraduate Student",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%A0%95%EC%9E%AC%EC%98%81/";
            },},{id: "people-hyokyeong-jung-정효경",
          title: 'Hyokyeong Jung(정효경)',
          description: "M.S. COUPANG",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%A0%95%ED%9A%A8%EA%B2%BD/";
            },},{id: "people-sangmin-jo-조상민",
          title: 'Sangmin Jo(조상민)',
          description: "M.S",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%A1%B0%EC%83%81%EB%AF%BC/";
            },},{id: "people-suhyeon-jo-조수현",
          title: 'Suhyeon Jo(조수현)',
          description: "M.S.",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%A1%B0%EC%88%98%ED%98%84/";
            },},{id: "people-hyungtae-jo-조형태",
          title: 'Hyungtae Jo(조형태)',
          description: "Doctor Program",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%A1%B0%ED%98%95%ED%83%9C/";
            },},{id: "people-byeongjun-joo-주병준",
          title: 'Byeongjun Joo(주병준)',
          description: "M.S. Senier professional at Samsung Electronics",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%A3%BC%EB%B3%91%EC%A4%80/";
            },},{id: "people-yulim-choi",
          title: 'Yulim Choi',
          description: "PhD. Principal Researcher at Hyundai Steel",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%B5%9C%EC%9C%A0%EB%A6%BC/";
            },},{id: "people-jungho-choo-추정호",
          title: 'Jungho Choo(추정호)',
          description: "M.S Program",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%B6%94%EC%A0%95%ED%98%B8/";
            },},{id: "people-muhammad-hanif-ramadhan-하니프",
          title: 'Muhammad Hanif Ramadhan (하니프)',
          description: "Integrated PhD program",
          section: "People",handler: () => {
              window.location.href = "/people/%ED%95%98%EB%8B%88%ED%94%84/";
            },},{id: "people-mingi-han-한민기",
          title: 'Mingi Han(한민기)',
          description: "Undergraduate Student",
          section: "People",handler: () => {
              window.location.href = "/people/%ED%95%9C%EB%AF%BC%EA%B8%B0/";
            },},{id: "people-yeongjae-han-한영재",
          title: 'Yeongjae Han(한영재)',
          description: "M.S. LG Electronics.",
          section: "People",handler: () => {
              window.location.href = "/people/%ED%95%9C%EC%98%81%EC%9E%AC/";
            },},{id: "people-jaehyeon-heo-허재현",
          title: 'Jaehyeon Heo(허재현)',
          description: "Integrated PhD program",
          section: "People",handler: () => {
              window.location.href = "/people/%ED%97%88%EC%9E%AC%ED%98%84/";
            },},{id: "people-seongmoon-hong-홍성문",
          title: 'Seongmoon Hong(홍성문)',
          description: "M.S",
          section: "People",handler: () => {
              window.location.href = "/people/%ED%99%8D%EC%84%B1%EB%AC%B8/";
            },},{id: "photo-2022-연구실-단체사진2",
          title: '2022 연구실 단체사진2',
          description: "2022 연구실 단체사진",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2022%EC%97%B0%EA%B5%AC%EC%8B%A4%EB%8B%A8%EC%B2%B4%EC%82%AC%EC%A7%842/";
            },},{id: "photo-2022-연구실-단체사진",
          title: '2022 연구실 단체사진',
          description: "2022 연구실 단체사진",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2022%EC%97%B0%EA%B5%AC%EC%8B%A4%EB%8B%A8%EC%B2%B4%EC%82%AC%EC%A7%84/";
            },},{id: "photo-2022-연구실-단체사진",
          title: '2022 연구실 단체사진',
          description: "2022 연구실 단체사진",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2022%EC%97%B0%EA%B5%AC%EC%8B%A4%EB%8B%A8%EC%B2%B4%EC%82%AC%EC%A7%843/";
            },},{id: "photo-2022년5월홈커밍데이",
          title: '2022년5월홈커밍데이',
          description: "2022년5월홈커밍데이",
          section: "Photo",handler: () => {
              window.location.href = "/photo/202205%EC%9B%94%ED%99%88%EC%BB%A4%EB%B0%8D%EB%8D%B0%EC%9D%B4/";
            },},{id: "photo-2022년5월홈커밍데이",
          title: '2022년5월홈커밍데이',
          description: "2022년5월홈커밍데이",
          section: "Photo",handler: () => {
              window.location.href = "/photo/202205%EC%9B%94%ED%99%88%EC%BB%A4%EB%B0%8D%EB%8D%B0%EC%9D%B42/";
            },},{id: "photo-2022년9월신입생-환영회",
          title: '2022년9월신입생 환영회',
          description: "2022년9월신입생 환영회",
          section: "Photo",handler: () => {
              window.location.href = "/photo/202209%EC%9B%94%EC%8B%A0%EC%9E%85%EC%83%9D%ED%99%98%EC%98%81%ED%9A%8C/";
            },},{id: "photo-2023년2월석사학위예정자학위논문발표회",
          title: '2023년2월석사학위예정자학위논문발표회',
          description: "2023년2월석사학위예정자학위논문발표회",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2023%EB%85%842%EC%9B%94%EC%84%9D%EC%82%AC%ED%95%99%EC%9C%84%EC%98%88%EC%A0%95%EC%9E%90%ED%95%99%EC%9C%84%EB%85%BC%EB%AC%B8%EB%B0%9C%ED%91%9C%ED%9A%8C/";
            },},{id: "photo-2023년2월석사학위예정자학위논문발표회",
          title: '2023년2월석사학위예정자학위논문발표회',
          description: "2023년2월석사학위예정자학위논문발표회",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2023%EB%85%842%EC%9B%94%EC%84%9D%EC%82%AC%ED%95%99%EC%9C%84%EC%98%88%EC%A0%95%EC%9E%90%ED%95%99%EC%9C%84%EB%85%BC%EB%AC%B8%EB%B0%9C%ED%91%9C%ED%9A%8C2/";
            },},{id: "photo-2023년2월석사학위예정자학위논문발표회",
          title: '2023년2월석사학위예정자학위논문발표회',
          description: "2023년2월석사학위예정자학위논문발표회",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2023%EB%85%842%EC%9B%94%EC%84%9D%EC%82%AC%ED%95%99%EC%9C%84%EC%98%88%EC%A0%95%EC%9E%90%ED%95%99%EC%9C%84%EB%85%BC%EB%AC%B8%EB%B0%9C%ED%91%9C%ED%9A%8C3/";
            },},{id: "photo-2023년-배혜림-교수님-교육용-유튜브-제작팀",
          title: '2023년 배혜림 교수님 교육용 유튜브 제작팀',
          description: "2023년 배혜림 교수님 교육용 유튜브 제작팀",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2023%EB%B0%B0%ED%98%9C%EB%A6%BC%EA%B5%90%EC%88%98%EB%8B%98%EA%B5%90%EC%9C%A1%EC%9A%A9%EC%9C%A0%ED%8A%9C%EB%B8%8C/";
            },},{id: "photo-2023년-배혜림-교수님-교육용-유튜브-제작팀",
          title: '2023년 배혜림 교수님 교육용 유튜브 제작팀',
          description: "2023년 배혜림 교수님 교육용 유튜브 제작팀",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2023%EB%B0%B0%ED%98%9C%EB%A6%BC%EA%B5%90%EC%88%98%EB%8B%98%EA%B5%90%EC%9C%A1%EC%9A%A9%EC%9C%A0%ED%8A%9C%EB%B8%8C2/";
            },},{id: "photo-2023년-연구실-회식",
          title: '2023년 연구실 회식',
          description: "2023년 풀타임, 파트타임, 학부연구생 전체 회식",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2023%EB%85%8403%EC%9B%94%EC%97%B0%EA%B5%AC%EC%8B%A4%ED%9A%8C%EC%8B%9D/";
            },},{id: "photo-2023년-대한산업공학회-춘계공동학술대회",
          title: '2023년 대한산업공학회 춘계공동학술대회',
          description: "2023년 대한산업공학회 춘계공동학술대회",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2023%EB%8C%80%ED%95%9C%EC%82%B0%EC%97%85%EA%B3%B5%ED%95%99%ED%9A%8C%EC%B6%98%EA%B3%84%20copy/";
            },},{id: "photo-2023년-대한산업공학회-춘계공동학술대회",
          title: '2023년 대한산업공학회 춘계공동학술대회',
          description: "2023년 대한산업공학회 춘계공동학술대회",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2023%EB%8C%80%ED%95%9C%EC%82%B0%EC%97%85%EA%B3%B5%ED%95%99%ED%9A%8C%EC%B6%98%EA%B3%84/";
            },},{id: "photo-2023-제-3회-가덕도신공항물류포럼",
          title: '2023 제 3회 가덕도신공항물류포럼',
          description: "2023 제 3회 가덕도신공항물류포럼",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2023%EA%B0%80%EB%8D%95%EB%8F%84%EC%8B%A0%EA%B3%B5%ED%95%AD%EB%AC%BC%EB%A5%98%ED%8F%AC%EB%9F%BC/";
            },},{id: "photo-2023-제-3회-가덕도신공항물류포럼",
          title: '2023 제 3회 가덕도신공항물류포럼',
          description: "2023 제 3회 가덕도신공항물류포럼",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2023%EA%B0%80%EB%8D%95%EB%8F%84%EC%8B%A0%EA%B3%B5%ED%95%AD%EB%AC%BC%EB%A5%98%ED%8F%AC%EB%9F%BC2/";
            },},{id: "photo-2023년-석사-학위예정자-학위논문-최종-발표회",
          title: '2023년 석사 학위예정자 학위논문 최종 발표회',
          description: "2023년 석사 학위예정자 학위논문 최종 발표회(이상재)",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2023%EB%85%84%EC%84%9D%EC%82%AC%ED%95%99%EC%9C%84%EC%98%88%EC%A0%95%EC%9E%90%ED%95%99%EC%9C%84%EB%85%BC%EB%AC%B8%EB%B0%9C%ED%91%9C%ED%9A%8C/";
            },},{id: "photo-2023-연구실-체육대회",
          title: '2023 연구실 체육대회',
          description: "2023 연구실 체육대회",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2023%EB%85%84%EC%97%B0%EA%B5%AC%EC%8B%A4%EC%B2%B4%EC%9C%A1%EB%8C%80%ED%9A%8C/";
            },},{id: "photo-2023-연구실-체육대회",
          title: '2023 연구실 체육대회',
          description: "2023 연구실 체육대회",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2023%EB%85%84%EC%97%B0%EA%B5%AC%EC%8B%A4%EC%B2%B4%EC%9C%A1%EB%8C%80%ED%9A%8C1/";
            },},{id: "photo-2023-연구실-체육대회",
          title: '2023 연구실 체육대회',
          description: "2023 연구실 체육대회",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2023%EB%85%84%EC%97%B0%EA%B5%AC%EC%8B%A4%EC%B2%B4%EC%9C%A1%EB%8C%80%ED%9A%8C2/";
            },},{id: "photo-2023-연구실-체육대회",
          title: '2023 연구실 체육대회',
          description: "2023 연구실 체육대회",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2023%EB%85%84%EC%97%B0%EA%B5%AC%EC%8B%A4%EC%B2%B4%EC%9C%A1%EB%8C%80%ED%9A%8C3/";
            },},{id: "photo-logms-부산",
          title: 'LogMS 부산',
          description: "LOGMS 2023 부산",
          section: "Photo",handler: () => {
              window.location.href = "/photo/logmsinbusan2023/";
            },},{id: "photo-logms-부산",
          title: 'LogMS 부산',
          description: "LOGMS 2023 부산",
          section: "Photo",handler: () => {
              window.location.href = "/photo/logmsinbusan20232/";
            },},{id: "photo-심성현교수님결혼식",
          title: '심성현교수님결혼식',
          description: "심성현교수님(졸업생) 결혼식",
          section: "Photo",handler: () => {
              window.location.href = "/photo/%EC%8B%AC%EC%84%B1%ED%98%84%EA%B5%90%EC%88%98%EB%8B%98%EA%B2%B0%ED%98%BC%EC%8B%9D/";
            },},{id: "photo-2024홈커밍데이",
          title: '2024홈커밍데이',
          description: "2024.03 홈커밍데이",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2024%ED%99%88%EC%BB%A4%EB%B0%8D%EB%8D%B0%EC%9D%B4/";
            },},{id: "photo-2024춘계산업공학회학술대회",
          title: '2024춘계산업공학회학술대회',
          description: "2024년 대한산업공학회 춘계공동학술대회",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2024%EB%85%84%EC%B6%98%EA%B3%84%EC%82%B0%EC%97%85%EA%B3%B5%ED%95%99%ED%9A%8C/";
            },},{id: "photo-제1회-탁구대회",
          title: '제1회 탁구대회',
          description: "제1회 탁구대회",
          section: "Photo",handler: () => {
              window.location.href = "/photo/%ED%83%81%EA%B5%AC%EB%8C%80%ED%9A%8C1/";
            },},{id: "photo-2024년-logms",
          title: '2024년 LOGMS',
          description: "LOGMS 2024, Hamburg, Germany",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2024LOGMS1/";
            },},{id: "photo-2024년-logms",
          title: '2024년 LOGMS',
          description: "LOGMS 2024, Hamburg, Germany",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2024LOGMS2/";
            },},{id: "photo-2024년-logms",
          title: '2024년 LOGMS',
          description: "LOGMS 2024, Hamburg, Germany",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2024LOGMS3/";
            },},{id: "photo-2024년-logms",
          title: '2024년 LOGMS',
          description: "LOGMS 2024, Hamburg, Germany",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2024LOGMS4/";
            },},{id: "photo-2024년-logms",
          title: '2024년 LOGMS',
          description: "LOGMS 2024, Hamburg, Germany",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2024LOGMS5md/";
            },},{id: "photo-2024년-logms",
          title: '2024년 LOGMS',
          description: "LOGMS 2024, Hamburg, Germany",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2024LOGMS6/";
            },},{id: "photo-sdp2024",
          title: 'SDP2024',
          description: "SDP, Rotterdam, Netherlands",
          section: "Photo",handler: () => {
              window.location.href = "/photo/SDP2024/";
            },},{id: "photo-sdp2024",
          title: 'SDP2024',
          description: "SDP, Rotterdam, Netherlands",
          section: "Photo",handler: () => {
              window.location.href = "/photo/SDP20241/";
            },},{id: "photo-sdp2024",
          title: 'SDP2024',
          description: "SDP, Rotterdam, Netherlands",
          section: "Photo",handler: () => {
              window.location.href = "/photo/SDP20242/";
            },},{id: "photo-추계학술대회",
          title: '추계학술대회',
          description: "2024 대한산업공학회 추계학술대회",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2024%EB%85%84%EC%B6%94%EA%B3%84%EC%82%B0%EC%97%85%EA%B3%B5%ED%95%99%ED%9A%8C/";
            },},{id: "photo-2024년중국zpmc워크숍",
          title: '2024년중국ZPMC워크숍',
          description: "ZPMC, Shanghai, China",
          section: "Photo",handler: () => {
              window.location.href = "/photo/%EC%A4%91%EA%B5%ADZPMC%EB%AF%B8%ED%8C%85/";
            },},{id: "photo-2024년중국관광",
          title: '2024년중국관광',
          description: "Workshop, Shanghai, China",
          section: "Photo",handler: () => {
              window.location.href = "/photo/%EC%A4%91%EA%B5%AD%EA%B4%80%EA%B4%91/";
            },},{id: "photo-2025년배랩단합대회",
          title: '2025년배랩단합대회',
          description: "2025년 BAELAB 단합대회",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2025%EB%85%84BAELAB%EB%8B%A8%ED%95%A9%EB%8C%80%ED%9A%8C/";
            },},{id: "photo-2025년배랩단합대회",
          title: '2025년배랩단합대회',
          description: "2025년 BAELAB 단합대회",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2025%EB%85%84BAELAB%EB%8B%A8%ED%95%A9%EB%8C%80%ED%9A%8C2/";
            },},{id: "photo-2025년배랩단합대회",
          title: '2025년배랩단합대회',
          description: "2025년 BAELAB 단합대회",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2025%EB%85%84BAELAB%EB%8B%A8%ED%95%A9%EB%8C%80%ED%9A%8C4/";
            },},{id: "photo-2025년배랩단합대회",
          title: '2025년배랩단합대회',
          description: "2025년 BAELAB 단합대회",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2025%EB%85%84BAELAB%EB%8B%A8%ED%95%A9%EB%8C%80%ED%9A%8C7/";
            },},{id: "photo-2025-상반기-제주도-선도워크숍",
          title: '2025_상반기_제주도_선도워크숍',
          description: "2025년 인간 중심-탄소 중립 글로벌 공급망 연구센터 워크숍",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2025%EC%84%A0%EB%8F%84%EC%9B%8C%ED%81%AC%EC%88%8D/";
            },},{id: "photo-2025-상반기-제주도-선도워크숍",
          title: '2025_상반기_제주도_선도워크숍',
          description: "2025년 대한산업공학회",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2025%EB%85%84%EC%83%81%EB%B0%98%EA%B8%B0%EC%82%B0%EC%97%85%EA%B3%B5%ED%95%99%ED%9A%8C/";
            },},{id: "photo-icpr28-chía-colombia",
          title: 'ICPR28,Chía, Colombia',
          description: "ICPR28,Chía, Colombia",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2025%EB%85%84%EC%BD%9C%EB%A1%AC%EB%B9%84%EC%95%84/";
            },},{id: "photo-icpr28-chía-colombia",
          title: 'ICPR28,Chía, Colombia',
          description: "ICPR28,Chía, Colombia",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2025%EB%85%84%EC%BD%9C%EB%A1%AC%EB%B9%84%EC%95%842/";
            },},{id: "photo-icpr28-chía-colombia",
          title: 'ICPR28,Chía, Colombia',
          description: "ICPR28,Chía, Colombia",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2025%EB%85%84%EC%BD%9C%EB%A1%AC%EB%B9%84%EC%95%843/";
            },},{id: "photo-2025년-icicic",
          title: '2025년 ICICIC',
          description: "ICICIC2025,Kitakyushu,Japan",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2025ICICIC1/";
            },},{id: "photo-2025년-icicic",
          title: '2025년 ICICIC',
          description: "ICICIC2025,Kitakyushu,Japan",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2025ICICIC2/";
            },},{id: "photo-2025년-logms",
          title: '2025년 LOGMS',
          description: "LOGMS2025, Sanghai,China",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2025LOGMS1/";
            },},{id: "photo-2025년-logms",
          title: '2025년 LOGMS',
          description: "LOGMS2025, Sanghai,China",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2025LOGMS2/";
            },},{id: "photo-2025년-logms",
          title: '2025년 LOGMS',
          description: "LOGMS2025, Sanghai,China",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2025LOGMS3/";
            },},{id: "photo-2025년-logms",
          title: '2025년 LOGMS',
          description: "LOGMS2025, Sanghai, China",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2025LOGMS4/";
            },},{id: "photo-2025년-logms",
          title: '2025년 LOGMS',
          description: "LOGMS2025, Sanghai, China",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2025LOGMS5/";
            },},{id: "photo-2025년bpm발표-스페인",
          title: '2025년BPM발표, 스페인',
          description: "BPM MAIN TRACK!!, Seville, Spain",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2025%EB%85%84%EC%8A%A4%ED%8E%98%EC%9D%B8%20copy/";
            },},{id: "photo-2025년bpm발표-스페인",
          title: '2025년BPM발표, 스페인',
          description: "BPM, Seville, Spain",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2025%EB%85%84%EC%8A%A4%ED%8E%98%EC%9D%B8/";
            },},{id: "photo-2025년연구실-단체축구-후-회식",
          title: '2025년연구실 단체축구 후 회식',
          description: "Soccer, 북구, Busan, Korea",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2025%EB%85%84%EC%97%B0%EA%B5%AC%EC%8B%A4%EC%B6%95%EA%B5%AC/";
            },},{id: "photo-2025-informs-annual-meeting",
          title: '2025 INFORMS ANNUAL MEETING',
          description: "2025 INFORMS ANNUAL MEETING, Atlanta, USA",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2025INFORMSANNUAL/";
            },},{id: "photo-추계학술대회",
          title: '추계학술대회',
          description: "2025 대한산업공학회 추계학술대회",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2025%EB%85%84%EC%B6%94%EA%B3%84%EC%82%B0%EC%97%85%EA%B3%B5%ED%95%99%ED%9A%8C/";
            },},{id: "photo-추계학술대회",
          title: '추계학술대회',
          description: "2025 대한산업공학회 추계학술대회",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2025%EB%85%84%EC%B6%94%EA%B3%84%EC%82%B0%EC%97%85%EA%B3%B5%ED%95%99%ED%9A%8C2/";
            },},{id: "photo-추계학술대회",
          title: '추계학술대회',
          description: "2025 대한산업공학회 추계학술대회",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2025%EB%85%84%EC%B6%94%EA%B3%84%EC%82%B0%EC%97%85%EA%B3%B5%ED%95%99%ED%9A%8C3/";
            },},{id: "photo-2025년-logms",
          title: '2025년 LOGMS',
          description: "SCI2025, Jinan, China",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2025SCI1/";
            },},{id: "photo-2025년-logms",
          title: '2025년 LOGMS',
          description: "SCI2025, Jinan, China",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2025SCI2/";
            },},{id: "photo-2025년-ieee-bigdata",
          title: '2025년 IEEE BIGDATA',
          description: "IEEE BIGDATA 2025, Macau SAR, China",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2025IEEEBIGDATA1/";
            },},{id: "photo-2025년-ieee-bigdata",
          title: '2025년 IEEE BIGDATA',
          description: "IEEE BIGDATA 2025, Macau SAR, China",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2025IEEEBIGDATA2/";
            },},{id: "photo-2025년-ieee-bigdata",
          title: '2025년 IEEE BIGDATA',
          description: "IEEE BIGDATA 2025, Macau SAR, China",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2025IEEEBIGDATA3/";
            },},{id: "projects-",
          title: '',
          description: "레이더 무기체계 주요 구성품의 CBM+ 솔루션 알고리즘 개발",
          section: "Projects",},{id: "projects-",
          title: '',
          description: "META K-PORT 지능화 물류 플랫폼",
          section: "Projects",},{id: "projects-",
          title: '',
          description: "동적 해양사고 시나리오 도출 및 실시간 사고위험 통합지표 기반 조기경보 시스템 개발",
          section: "Projects",},{id: "projects-",
          title: '',
          description: "감귤 가격 및 출하량 예측 모델 개발",
          section: "Projects",},{id: "projects-",
          title: '',
          description: "공기압축기 데이터 분석 및 고장예측 연구 용역",
          section: "Projects",},{id: "projects-",
          title: '',
          description: "지역산업 혁신을 위한 지역 수요 중심 데이터사이언스 융합인재 양성사업",
          section: "Projects",},{id: "projects-",
          title: '',
          description: "물류 최적화를 위한 AI 알고리즘 개발",
          section: "Projects",},{id: "projects-",
          title: '',
          description: "부산항 컨테이너 하역 작업수행 요구시간 AI 예측 모델 개발",
          section: "Projects",},{id: "projects-",
          title: '',
          description: "부산항 환적 업무 분석",
          section: "Projects",},{id: "projects-",
          title: '',
          description: "블록물류 최적화",
          section: "Projects",},{id: "projects-",
          title: '',
          description: "빅데이터/인공지능 기반 물류 연계 최적화 기술 개발",
          section: "Projects",},{id: "projects-",
          title: '',
          description: "스마트 에어솔루션 사용자 별 행동 모델링을 위한 프로세스 마이닝 및 인공지능 기반의 공감지능(Affectionate Intelligence, AI) 기술개발",
          section: "Projects",},{id: "projects-",
          title: '',
          description: "인공지능 기반 XPL 방법론 연구 한국연구재단(중견후속연구)",
          section: "Projects",},{id: "projects-",
          title: '',
          description: "차량반출입예약시스템 해외 항만 적용사례 분석",
          section: "Projects",},{id: "projects-",
          title: '',
          description: "인간 중심 - 탄소 중립 글로벌 공급망 연구센터",
          section: "Projects",},{id: "projects-",
          title: '',
          description: "항만 적정하역능력 산정을 위한 데이터 확보방안 수립 연구용역",
          section: "Projects",},{id: "projects-",
          title: '',
          description: "해상교통 환경 특화 대형행동모형 개발을 위한 에이전트 기술 개발",
          section: "Projects",},{id: "projects-",
          title: '',
          description: "해양플랫폼 통합통제 관리 기술 개발",
          section: "Projects",},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%68%72%62%61%65@%70%75%73%61%6E.%61%63.%6B%72", "_blank");
        },
      },{
        id: 'social-ieee',
        title: 'IEEE Xplore',
        section: 'Socials',
        handler: () => {
          window.open("https://ieeexplore.ieee.org/author/37593905800/", "_blank");
        },
      },{
        id: 'social-linkedin',
        title: 'LinkedIn',
        section: 'Socials',
        handler: () => {
          window.open("https://www.linkedin.com/in/hyerim-bae-184400b1", "_blank");
        },
      },{
        id: 'social-orcid',
        title: 'ORCID',
        section: 'Socials',
        handler: () => {
          window.open("https://orcid.org/0000-0003-2602-5911", "_blank");
        },
      },{
        id: 'social-rss',
        title: 'RSS Feed',
        section: 'Socials',
        handler: () => {
          window.open("/feed.xml", "_blank");
        },
      },{
        id: 'social-scholar',
        title: 'Google Scholar',
        section: 'Socials',
        handler: () => {
          window.open("https://scholar.google.com/citations?user=2lBv9WUAAAAJ", "_blank");
        },
      },{
        id: 'social-youtube',
        title: 'YouTube',
        section: 'Socials',
        handler: () => {
          window.open("https://youtube.com/@smchain406", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
