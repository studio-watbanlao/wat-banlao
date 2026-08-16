'use client';

import { Container, Stack, Typography } from '@mui/material';

import HomeAdvertisement from '../home-advertisement';
import HomeAgencies from '../home-agencies';
import HomeArticle from '../home-article';
import HomeBannerList from '../home-banner-list';
import HomeDailyDhamma from '../home-daily-dhamma';
import HomeHistory from '../home-history';
import HomeLooking from '../home-looking';
import HomeLookingFor from '../home-looking-for';
import HomeMinimal from '../home-minimal';
import HomeTeam from '../home-team';
import HomeTempleFestival from '../home-temple-festival';
import WebsiteVisitorCount from '../website-visitor-count';

import { CONFIG } from 'src/config-global';
import { usePublicTemple } from 'src/hooks/use-public-temple';
import { useGetBanner } from 'src/queries/banner';

const ClassicHomeView = () => {
  const { data = [] } = useGetBanner();

  return (
    <>
      <Container
        maxWidth="xl"
        sx={{
          mt: 4,
        }}
      >
        <HomeBannerList list={data} />
      </Container>

      <Container
        maxWidth="xl"
        sx={{
          py: { xs: CONFIG.layout.HEIGHT_LAYOUT_XS, md: CONFIG.layout.HEIGHT_LAYOUT },
        }}
      >
        <Stack
          sx={{
            display: 'flex',
            alignItems: 'center',
            textAlign: 'center',
          }}
          spacing={1}
          mt={5}
        >
          <Typography variant="h3">&quot; บวร &quot;</Typography>
          <Typography variant="body1">
            “ วัดจะดีมีหลักฐานเพราะบ้านช่วย บ้านจะสวยเพราะมีวัดดัดนิสัย
            บ้านกับวัดผลัดกันช่วยก็อวยชัย ถ้าขัดกันก็บรรลัยทั้งสองทาง ”
          </Typography>
          <Typography variant="body1">
            สุภาษิตนี้ เรามักจะเห็นกันเมื่อไปวัดวาอารามต่างๆ
            เพื่อบ่งบอกให้รู้ว่าบ้านและวัดขาดกันไม่ได้เลย
            นอกจากนี้ยังมีโรงเรียนที่เข้ามามีบทบาทในสองหน่วยหลักทางสังคมเพิ่มอีกหนึ่ง คำว่า “บวร”
            จึงไม่ได้มีความหมายตามพจนานุกรมไทยที่แปลว่า ประเสริฐ, ล้ำเลิศ เท่านั้น แต่มันมีที่มาจาก
          </Typography>
          <Typography variant="body1">
            <Typography component={'span'} variant="subtitle1">
              &quot; บ &quot;
            </Typography>{' '}
            คือ บ้าน บ้านที่มีชาวบ้าน มีคนอาศัยอยู่ผู้ที่จะสืบสานวัฒนธรรม ศาสนา
            และซึมซับคำสอนจากพระสงฆ์เป็นผู้ส่งเสริมสนับสนุนให้พระพุทธศาสนาได้ยั่งยืนยาวนานอย่างถึงแก่นแท้{' '}
            <br />{' '}
            <Typography component={'span'} variant="subtitle1">
              &quot; ว &quot;
            </Typography>{' '}
            คือ วัด
            วัดที่มีพระสงฆ์ผู้ที่อาสาจะละกิเลสทางโลกมาศึกษาพระธรรมเพื่อเผยแผ่หลักพุทธศาสนาให้ชาวบ้านได้เข้าใจถึงการดำรงชีวิตอย่างสงบเป็นสุข
            <br />
            <Typography component={'span'} variant="subtitle1">
              &quot; ร &quot;
            </Typography>{' '}
            คือ โรงเรียน เดิมทีแหล่งที่ประสิทธิประสาทวิชาความรู้นั้นคือวัด
            ต่อมาได้แยกออกมาเป็นโรงเรียนที่เป็นสถานให้การศึกษาโดยตรงต่อทุกเพศ
            ทุกวัยซึ่งปัจจุบันยังมีโรงเรียนอีกหลายแห่งที่ยังมีชื่อวัดเป็นชื่อโรงเรียนอยู่
            ฉะนั้นคำว่า
            <br />{' '}
            <Typography component={'span'} variant="subtitle1">
              “บวร”
            </Typography>{' '}
            จึงไม่ใช่เพียงคำประกอบที่ใช้เรียกสถานที่ต่างๆ เท่านั้นมันมีที่มาถึงสังคมที่เกื้อกูล
            ส่งเสริม ช่วยเหลือ ซึ่งกันและกันในวงเวียนสังคมนั้นๆ
            ความเจริญที่แท้จริงของสังคมที่จะมีความสุขจึงจะสมบูรณ์แบบ
          </Typography>
        </Stack>
      </Container>

      <HomeMinimal />

      <HomeHistory />

      {/* <HomeRip /> */}

      <HomeDailyDhamma />

      <HomeLookingFor />

      <HomeTeam />

      <HomeLooking />

      <HomeTempleFestival />

      <HomeArticle />

      <HomeAgencies />
      {/* <CarouselCenterMode data={_carouselsExample.slice(1, 5)} /> */}

      <HomeAdvertisement />
    </>
  );
};

const HomeView = () => {
  const { data: temple } = usePublicTemple();

  return (
    <>
      <ClassicHomeView />
      <WebsiteVisitorCount templeId={temple?.id} />
    </>
  );
};

export default HomeView;
