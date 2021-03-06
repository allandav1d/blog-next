/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { FiCalendar, FiUser } from 'react-icons/fi';
import { GetStaticProps } from 'next';
import { format } from 'date-fns';
import Link from 'next/link';
import Prismic from '@prismicio/client';
import ptBR from 'date-fns/locale/pt-BR';
import { useEffect, useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function Home({ postsPagination }: HomeProps) {
  const [loadedPosts, setLoadedPosts] = useState<Post[]>([]);

  async function handleLoadData() {
    const response = await fetch(postsPagination.next_page);
    const data = await response.json();
    const posts = data.results.map(item => {
      return {
        uid: item.uid,
        first_publication_date: item.first_publication_date,
        data: {
          title: item.data.title,
          subtitle: item.data.subtitle,
          author: item.data.author,
        },
      };
    });

    setLoadedPosts(posts);
  }

  return (
    <div>
      <Header />
      <section className={commonStyles.container}>
        {postsPagination.results.map((item: Post) => (
          <div key={item.uid} className={styles.postContainer}>
            <Link href={`/post/${item.uid}`}>
              <a>
                <h1>{item.data.title}</h1>
              </a>
            </Link>
            <p>{item.data.subtitle}</p>
            <div>
              <FiCalendar color="#d7d7d7" />
              {format(new Date(item.first_publication_date), 'd MMM yyyy', {
                locale: ptBR,
              })}
              <div>
                <FiUser color="#d7d7d7" /> {item.data.author}
              </div>
            </div>
          </div>
        ))}
        {loadedPosts.map((item: Post) => (
          <div key={item.uid} className={styles.postContainer}>
            <Link href={`/post/${item.uid}`}>
              <a>
                <h1>{item.data.title}</h1>
              </a>
            </Link>
            <p>{item.data.subtitle}</p>
            <div>
              <FiCalendar color="#d7d7d7" />
              {format(new Date(item.first_publication_date), 'd MMM yyyy', {
                locale: ptBR,
              })}
              <div>
                <FiUser color="#d7d7d7" /> {item.data.author}
              </div>
            </div>
          </div>
        ))}

        {postsPagination.next_page && (
          <button
            type="button"
            onClick={handleLoadData}
            className={styles.loadPosts}
          >
            Carregar mais posts
          </button>
        )}
      </section>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const response = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      fetch: [
        'posts.title',
        'posts.uid',
        'posts.first_publication_date',
        'posts.subtitle',
        'posts.author',
      ],
      pageSize: 1,
    }
  );

  const posts = response.results.map(item => {
    return {
      uid: item.uid,
      first_publication_date: item.first_publication_date,
      data: {
        title: item.data.title,
        subtitle: item.data.subtitle,
        author: item.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        results: posts,
        next_page: response.next_page,
      },
    },
    revalidate: 60 * 30,
  };
};
