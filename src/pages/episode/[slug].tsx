import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
// import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';

import { api } from '../../services/api';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';
import styles from './episode.module.scss';
// import { useContext } from 'react';
import { PlayerContext, usePlayer } from '../../contexts/PlayerContext';

interface Episode {
    id: string,
    title: string,
    members: string,
    duration: number,
    durationAsString: string,
    thumbnail: string,
    url: string,
    publishedAt: string,
    description: string
}

interface EpisodeProps {
    episode: Episode
}

export default function Episode({ episode }: EpisodeProps) {
    // const route = useRouter();
    // console.log('Slug: ', route.query.slug);

    // Como eu estou usando fallback blockching eu não preciso usar isso, pois a requisição não está sendo feita pelo cliente
    // const router = useRouter();

    // if (router.isFallback) { // Se a página estiver em processo de carregamento retorna um "Carregando..."
    //     return <p>Carregando...</p>;
    // }

    // const { } = useContext(PlayerContext);
    const { play } = usePlayer();
 
    return (
        <div className={styles.episode}>

            <Head>
                <title>{episode.title}</title>
            </Head>

            <div className={styles.thumbnailContainer}>
                <Link href='/'>
                    <button type='button'>
                        <img src="/arrow-left.svg" alt="Voltar"/>
                    </button>
                </Link>

                <Image width={700} height={320} objectFit='cover' src={episode.thumbnail}></Image>

                <button type='button' onClick={() => {play(episode)}}>
                    <img src="/play.svg" alt="Tocar episódio"/>
                </button>
            </div>

            <header>
                <h1>{episode.title}</h1>

                <span>{episode.members}</span>
                <span>{episode.publishedAt}</span>
                <span>{episode.durationAsString}</span>
            </header>

            <div className={styles.description} dangerouslySetInnerHTML={{__html: episode.description}} />
        </div>
    );
}

export const getStaticPaths: GetStaticPaths = async () => { // Obrigatório em toda rota que gera uma página estática porém que tem parâmetros dinâmicos
    // Caso eu precise de dados para serem mostrados de forma estática eu posso fazer um "fecth" para buscar esses dados e colocá-los no "paths", por exemplo, categorias mais acessadas de um e-commerce
    const { data } = await api.get('episodes', {
        params: {
          _limit: 2,
          _sort: "published_at",
          _order: "desc"
        }
    });
    
    const paths = data.map(episode => {
        return {
            params: {
                slug: episode.id
            }
        }
    });

    return {
        paths,
        // paths: [ // Se eu passar os paths vazio nenhuma página estática será gerada no momento do build
        //     // {
        //     //     params: {
        //     //         slug: "a-importancia-da-contribuicao-em-open-source" // Página que irá ser gerada de forma estática no momento do build do projeto
        //     //     }
        //     // }
        // ],
        // fallback: false // Se eu não passar nenhum parâmetro no paths e aqui estiver false ele me retornará erro 404 ao tentar acessar a página
        // fallback: true // Se a pessoa acessar um episódio e ele não foi gerado de forma estática, ele vai tentar buscar os dados para gerar uma página estática e salvar em disco, se aqui for true essa requisição acontece pelo lado do cliente (browser)
        fallback: 'blocking' // Ele faz o mesmo que o true, porém, ele roda no next (nodejs) e o usuário só vai para a tela quando tudo estiver carregado - melhor para SEO também
        // O blockching (incremental static regeneration - true também) vai gerando as páginas não listadas quando os usuários vão acessando-as
    }

}

export const getStaticProps: GetStaticProps = async (context) => {
    const { slug } = context.params;

    const { data } = await api.get(`episodes/${slug}`);

    const episode = {
          id: data.id,
          title: data.title,
          thumbnail: data.thumbnail,
          members: data.members,
          publishedAt: format(parseISO(data.published_at), 'd MMM yy', {
            locale: ptBR
          }),
          duration: Number(data.file.duration),
          durationAsString: convertDurationToTimeString(Number(data.file.duration)),
          description: data.description,
          url: data.file.url
        }

    return {
        props: {
            episode
        },
        revalidate: 60 * 60 * 24, // 24 hours
    }
}