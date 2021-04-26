// Tipos de requisições em cada modelo de aplicação
// SPA (Single Page Application)
// SSR (Server Side Rendering)
// SSG (Static Side Generation)

// import { useEffect } from "react";

import { GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';
import { useContext } from 'react';

import { api } from '../services/api';
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';
import styles from './home.module.scss';
import { PlayerContext } from '../contexts/PlayerContext';

type Episode = {
    id: string,
    title: string,
    members: string,
    duration: number,
    durationAsString: string,
    thumbnail: string,
    url: string,
    publishedAt: string
}

type HomeProps = {
  latestEpisodes: Array<Episode>,
  allEpisodes: Array<Episode> // Episode[]
}

// type HomeProps = {
//   episodes: Array<{
//     id: string,
//     title: string,
//     members: string
//   }>
// }

export default function Home({ latestEpisodes, allEpisodes }:HomeProps) {
  // SPA 
  // useEffect(() => {
  //   fetch('http://localhost:3333/episodes').then((response) => {
  //     return response.json();
  //   }).then((data) => {
  //     return console.log(data);
  //   });
  // }, []);
  const { playList } = useContext(PlayerContext);

  const episodesList = [...latestEpisodes, ...allEpisodes]; // Junta os dois últimos episódios com o restante dos episódios

  return (
    <div className={styles.homePage}>
      <Head>
        <title>Home || Podcastr</title>
      </Head>

      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>

        <ul>
          {
            latestEpisodes.map((episode, index) => {
              return (
                <li key={episode.id}>
                  <Image objectFit="cover" width={192} height={192} src={episode.thumbnail} alt={episode.title}/>

                  <div className={styles.episodeDetails}>
                    {/* <Link href={`/episode/${episode.id}`}>{episode.title}</Link> */}

                    <Link href={`/episode/${episode.id}`}>
                      <a>{episode.title}</a>
                    </Link>
                    {/* <a href={`/episode/${episode.id}`}>{episode.title}</a> */}

                    <p>{episode.members}</p>

                    <span>{episode.publishedAt}</span>
                    <span>{episode.durationAsString}</span>
                  </div>

                  <button type='button' onClick={() => {playList(episodesList, index)}}>
                    <img src="/play-green.svg" alt="Tocar episódio"/>
                  </button>
                </li>
              );
            })
          }
        </ul>
      </section>

      <section className={styles.allEpisodes}>
          <h2>Todos episódios</h2>

          <table cellSpacing={0}> 
            <thead>
              <tr>
                <th></th>
                <th>podcast</th>
                <th>intergrantes</th>
                <th>data</th>
                <th>duração</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {
                allEpisodes.map((episode, index) => {
                  return (
                    <tr key={episode.id}>
                      <td style={{width: 72}}>
                        <Image width={120} height={120} src={episode.thumbnail} alt={episode.title} objectFit='cover'></Image>
                      </td>
                      <td>
                        <Link href={`/episode/${episode.id}`}>
                          <a>{episode.title}</a>
                        </Link>
                      </td>
                      <td>{episode.members}</td>
                      <td style={{width: 100}}>{episode.publishedAt}</td>
                      <td>{episode.durationAsString}</td>
                      <td>
                        <button type='button' onClick={() => {playList(episodesList, index + latestEpisodes.length)}}> {/* index (0) + últimos episódios (2) */}
                          <img src="/play-green.svg" alt="Tocar episódio"/>
                        </button>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
      </section>
    </div>
  );
}

// SSR 
// Ele executa toda vez que o usuário acessar a aplicação (nesse caso a página home - index.tsx)
// export async function getServerSideProps() { // O NEXT executa essa função antes de exibir o conteúdo pro usuário
//   const response = await  fetch('http://localhost:3333/episodes');
//   const data = response.json();

//   return { // Os dados buscados são retornados para as props do componente
//     props: {
//       episodes: data
//     }
//   }
// }

// SSG
export const getStaticProps: GetStaticProps = async () => { // O NEXT executa essa função antes de exibir o conteúdo pro usuário
  // const response = await fetch('http://localhost:3333/episodes?_limit=12&_sort=published_at&_order=desc');
  // const data = await response.json();

  const { data } = await api.get('episodes', {
    params: {
      _limit: 12,
      _sort: "published_at",
      _order: "desc"
    }
  });

  const episodes = data.map((episode) => {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', {
        locale: ptBR
      }),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
      url: episode.file.url
    }
  });

  const latestEpisodes = episodes.slice(0, 2); // Pega os dois últimos episódios (os dois primeiros do array)
  const allEpisodes = episodes.slice(2, episodes.length);

  return { 
    props: { // Os dados buscados são retornados para as props do componente
      latestEpisodes,
      allEpisodes
    },
    revalidate: 60 * 60 * 8, // Tempo no qual será feito uma nova chamada para a API para a atualização dos dados, nesse caso 8 horas
  } 
}