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
        },{id: "nav-repo",
          title: "Repo",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/repositories/";
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
            },},{id: "news-주제발표하는-배혜림-부산대-교수",
          title: '주제발표하는 배혜림 부산대 교수',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/%EC%A3%BC%EC%A0%9C%EB%B0%9C%ED%91%9C%ED%95%98%EB%8A%94%20%EB%B0%B0%ED%98%9C%EB%A6%BC%20%EB%B6%80%EC%82%B0%EB%8C%80%20%EA%B5%90%EC%88%98/";
            },},{id: "news-congratulation-daesan-park-and-hyunha-lee-have-accepted-their-presentation-in-informs-annual-meeting-2025",
          title: 'Congratulation 🎓🍑 🇺🇸 !!! Daesan Park and Hyunha Lee have accepted their presentation...',
          description: "",
          section: "News",},{id: "news-selamat-tinggal-dan-selamat-️-mingi-han-has-submitted-a-paper-to-the-journal-of-the-korean-institute-of-industrial-engineers-jkiie",
          title: 'Selamat tinggal dan selamat! 🏝️ 🌋🐚 !!! Mingi Han has submitted a paper...',
          description: "",
          section: "News",},{id: "news-informs-international-2025-invitation-with-김도희-권재은",
          title: 'INFORMS International 2025 Invitation with 김도희, 권재은',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/informs/";
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
            },},{id: "people-hanseok-kang-강한석",
          title: 'Hanseok Kang(강한석)',
          description: "M.S. 주임 at 파크랜드 월드",
          section: "People",handler: () => {
              window.location.href = "/people/%EA%B0%95%ED%95%9C%EC%84%9D/";
            },},{id: "people-jaeun-kwon-권재은",
          title: 'Jaeun Kwon(권재은)',
          description: "Integrated PhD program",
          section: "People",handler: () => {
              window.location.href = "/people/%EA%B6%8C%EC%9E%AC%EC%9D%80/";
            },},{id: "people-hyeunho-kwun-권현호",
          title: 'Hyeunho Kwun(권현호)',
          description: "M.S. 신용보증기금",
          section: "People",handler: () => {
              window.location.href = "/people/%EA%B6%8C%ED%98%84%ED%98%B8/";
            },},{id: "people-dohee-kim-김도희",
          title: 'Dohee Kim(김도희)',
          description: "PhD. Postdoctoral Researher at SCSC Research Center",
          section: "People",handler: () => {
              window.location.href = "/people/%EA%B9%80%EB%8F%84%ED%9D%AC/";
            },},{id: "people-minseop-kim-김민섭",
          title: 'Minseop Kim(김민섭)',
          description: "Integrated PhD program",
          section: "People",handler: () => {
              window.location.href = "/people/%EA%B9%80%EB%AF%BC%EC%84%AD/";
            },},{id: "people-minhee-kim-김민희",
          title: 'Minhee Kim(김민희)',
          description: "M.S Program",
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
            },},{id: "people-kikun-park-박기군",
          title: 'Kikun Park(박기군)',
          description: "PhD. Postdoctoral Researher at SCSC Research Center",
          section: "People",handler: () => {
              window.location.href = "/people/%EB%B0%95%EA%B8%B0%EA%B5%B0/";
            },},{id: "people-daesan-park-박대산",
          title: 'Daesan Park(박대산)',
          description: "M.S Program",
          section: "People",handler: () => {
              window.location.href = "/people/%EB%B0%95%EB%8C%80%EC%82%B0/";
            },},{id: "people-mingyu-park-박민규",
          title: 'Mingyu Park(박민규)',
          description: "M.S. Researcher at LIG Nex1",
          section: "People",handler: () => {
              window.location.href = "/people/%EB%B0%95%EB%AF%BC%EA%B7%9C/";
            },},{id: "people-eunhee-park-박은희",
          title: 'Eunhee Park(박은희)',
          description: "M.S Program",
          section: "People",handler: () => {
              window.location.href = "/people/%EB%B0%95%EC%9D%80%ED%9D%AC/";
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
            },},{id: "people-junhyuk-seo-서준혁",
          title: 'Junhyuk Seo(서준혁)',
          description: "Integrated PhD program",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%84%9C%EC%A4%80%ED%98%81/";
            },},{id: "people-sunghyun-sim-심성현",
          title: 'SungHyun Sim(심성현)',
          description: "PhD. Professor at Changwon National Univ, School of Artificial Intelligence Convergence Engineering",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%8B%AC%EC%84%B1%ED%98%84/";
            },},{id: "people-alif-nur-iman-아리프",
          title: 'Alif Nur Iman(아리프)',
          description: "Ph.D Program",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%95%84%EB%A6%AC%ED%94%84/";
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
            },},{id: "people-sang-jae-lee-이상재",
          title: 'Sang Jae Lee(이상재)',
          description: "M.S. LG Energy Solution",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%9D%B4%EC%83%81%EC%9E%AC/";
            },},{id: "people-yongjae-lee-이용재",
          title: 'Yongjae Lee(이용재)',
          description: "M.S Program",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%9D%B4%EC%9A%A9%EC%9E%AC/";
            },},{id: "people-eunju-lee-이은주",
          title: 'Eunju Lee(이은주)',
          description: "M.S. Researcher at FITI",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%9D%B4%EC%9D%80%EC%A3%BC/";
            },},{id: "people-hyunha-lee-이현하",
          title: 'Hyunha Lee(이현하)',
          description: "Undergraduate Student",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%9D%B4%ED%98%84%ED%95%98/";
            },},{id: "people-hyokyeong-jung-정효경",
          title: 'HyoKyeong Jung(정효경)',
          description: "M.S.",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%A0%95%ED%9A%A8%EA%B2%BD/";
            },},{id: "people-sangmin-jo-조상민",
          title: 'Sangmin Jo(조상민)',
          description: "M.S Program",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%A1%B0%EC%83%81%EB%AF%BC/";
            },},{id: "people-suhyeon-jo-조수현",
          title: 'Suhyeon Jo(조수현)',
          description: "M.S.",
          section: "People",handler: () => {
              window.location.href = "/people/%EC%A1%B0%EC%88%98%ED%98%84/";
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
          description: "M.S Program",
          section: "People",handler: () => {
              window.location.href = "/people/%ED%99%8D%EC%84%B1%EB%AC%B8/";
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
            },},{id: "photo-추계학술대회",
          title: '추계학술대회',
          description: "2024 대한산업공학회 추계학술대회",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2024%EB%85%84%EC%B6%94%EA%B3%84%EC%82%B0%EC%97%85%EA%B3%B5%ED%95%99%ED%9A%8C/";
            },},{id: "photo-2024년중국zpmc워크숍",
          title: '2024년중국ZPMC워크숍',
          description: "ZPMC 미팅",
          section: "Photo",handler: () => {
              window.location.href = "/photo/%EC%A4%91%EA%B5%ADZPMC%EB%AF%B8%ED%8C%85/";
            },},{id: "photo-2024년중국관광",
          title: '2024년중국관광',
          description: "중국관광",
          section: "Photo",handler: () => {
              window.location.href = "/photo/%EC%A4%91%EA%B5%AD%EA%B4%80%EA%B4%91/";
            },},{id: "photo-2025년배랩단합대회",
          title: '2025년배랩단합대회',
          description: "2025년 BAELAB 단합대회 (전체사진)",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2025%EB%85%84BAELAB%EB%8B%A8%ED%95%A9%EB%8C%80%ED%9A%8C/";
            },},{id: "photo-2025년배랩단합대회",
          title: '2025년배랩단합대회',
          description: "2025년 BAELAB 단합대회 (탁구사진)",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2025%EB%85%84BAELAB%EB%8B%A8%ED%95%A9%EB%8C%80%ED%9A%8C2/";
            },},{id: "photo-2025년배랩단합대회",
          title: '2025년배랩단합대회',
          description: "2025년 BAELAB 단합대회 (탁구사진)",
          section: "Photo",handler: () => {
              window.location.href = "/photo/2025%EB%85%84BAELAB%EB%8B%A8%ED%95%A9%EB%8C%80%ED%9A%8C4/";
            },},{id: "photo-2025년배랩단합대회",
          title: '2025년배랩단합대회',
          description: "2025년 BAELAB 단합대회 (족구사진)",
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
            },},{id: "projects-",
          title: '',
          description: "레이더 무기체계 주요 구성품의 CBM+ 솔루션 알고리즘 개발",
          section: "Projects",},{id: "projects-",
          title: '',
          description: "META K-PORT 지능화 물류 플랫폼",
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
          window.open("https://www.linkedin.com/in/혜림-배-184400b1", "_blank");
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
