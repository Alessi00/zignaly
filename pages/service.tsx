// import Container from "../components/container";
// import MoreStories from "../components/more-stories";
// import HeroPost from "../components/hero-post";
// import Intro from "../components/intro";
// import Layout from "../components/layout";
// import { getAllPosts } from "../lib/api";
import { Button, Container } from "@mui/material";
import Head from "next/head";
import type { NextPage } from "next";
import ServiceDashboard from "../components/ServiceDashboard/ServiceDashboard";
import { CMS_NAME } from "../lib/constants";
import MainLayout from "../components/MainLayout";
// import Post from "../types/post";

type Props = {};

const Index = ({}: Props) => {
  // const heroPost = allPosts[0];
  // const morePosts = allPosts.slice(1);
  return (
    <MainLayout>
      <Container maxWidth="lg">
        <Head>
          <title>Next.js Blog Example with {CMS_NAME}</title>
        </Head>
        {/* <Container>
          <Intro />
          {heroPost && (
            <HeroPost
              title={heroPost.title}
              coverImage={heroPost.coverImage}
              date={heroPost.date}
              author={heroPost.author}
              slug={heroPost.slug}
              excerpt={heroPost.excerpt}
            />
          )}
          {morePosts.length > 0 && <MoreStories posts={morePosts} />}
        </Container> */}
        <ServiceDashboard />
      </Container>
    </MainLayout>
  );
};

export default Index;

// export const getStaticProps = async () => {
//   const allPosts = getAllPosts(["title", "date", "slug", "author", "coverImage", "excerpt"]);

//   return {
//     props: { allPosts },
//   };
// };