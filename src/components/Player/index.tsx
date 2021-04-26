import { useContext, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Slider from 'rc-slider';

import 'rc-slider/assets/index.css';

import { PlayerContext } from '../../contexts/PlayerContext';
import styles from './styles.module.scss';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

export function Player() {
    const [progress, setProgress] = useState(0);

    const audioRef = useRef<HTMLAudioElement>(null); // useRef serve para que a gente possa alterar e interagir com elementos nativos do HTML no React

    const { 
        episodeList, 
        currentEpisodeIndex, 
        isPlaying, 
        togglePlay, 
        setPlayingState,
        playNext,
        playPrevious,
        hasNext,
        hasPrevious,
        isLooping,
        toggleLoop,
        toggleShuffle,
        isShuffling,
        clearPlayerState
    } = useContext(PlayerContext);

    const episode = episodeList[currentEpisodeIndex];

    useEffect(() => {
        if (!audioRef.current) { // Verifica se o audioRef está vazio, se não exeistir audioRef retorna "nada"
            return;
        } 

        if (isPlaying) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    function setupProgressListener() {
        audioRef.current.currentTime = 0; // Seta o tempo do time para zero

        audioRef.current.addEventListener('timeupdate', () => { // O "timeupdate" é disparado sempre que o time está tocando
            setProgress(Math.floor(audioRef.current.currentTime));
        });
    }

    function handleSeek(amount: number) {
        audioRef.current.currentTime = amount; // Seta o tempo do audio para o arrastado pelo o usuário
        setProgress(amount);
    }

    function handleEpisodeEnded() {
        if (hasNext) {
            playNext();
        } else {
            clearPlayerState();
        }
    }

    return (
        <div className={styles.playerContainer}>
            <header>
                <img src="/playing.svg" alt="Tocando agora"/>
                <strong>Tocando agora</strong>

                {/* <strong>Tocando agora {episode?.title}</strong> */}
            </header>

            {
                episode ? (
                    <div className={styles.currentEpisode}>
                        <Image width={592} height={592} objectFit='cover' src={episode.thumbnail} alt={episode.title}></Image>

                        <strong>{episode.title}</strong>
                        <span>{episode.members}</span>
                    </div>
                ) : (
                    <div className={styles.emptyPlayer}>
                        <strong>Selecione um podcast para ouvir</strong>
                    </div>
                )
            }

            <footer className={!episode ? styles.empty : ''}>
                <div className={styles.progress}>
                    <span>{convertDurationToTimeString(progress)}</span>

                    <div className={styles.slider}>
                        {
                            episode ? (
                                <Slider 
                                    trackStyle={{ backgroundColor: '#04d361' }} // Cor da barra de progresso do que já foi assistido
                                    railStyle={{backgroundColor: '#9f75ff' }} // Cor da barra de progresso do que não foi assistido
                                    handleStyle={{ borderColor: '#04d361', borderWidth: 4 }} // Cor da bola da barra de progresso
                                    max={episode.duration} // O valor máximo do slider (duração máxima que ele pode chegar)
                                    value={progress} // O quanto o episódio já progrediu
                                    onChange={handleSeek}
                                />
                            ) : (
                                <div className={styles.emptySlider}></div>
                            )
                        }
                    </div>

                    <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span> {/* Verifica se o episódio está vazio, se não estiver ele converte o duration para um tempo formatado (HH:MM:SS), se estiver vazio mostra tudo 0 */}
                </div>

                {
                    episode && (
                        <audio 
                            src={episode.url} 
                            ref={audioRef} // O audioRef vai servir para usar e realizar as ações da tag audio
                            autoPlay
                            loop={isLooping}
                            onLoadedMetadata={setupProgressListener} // Esse evento ele dispara assim que o player conseguiu carregar os dados do episódio
                            onPlay={() => {
                                setPlayingState(true);
                            }}
                            onPause={() => {
                                setPlayingState(false);
                            }}
                            onEnded={handleEpisodeEnded}
                        ></audio>
                    )
                }

                <div className={styles.buttons}>
                    {/* Desativa o botão caso não tenha um episódio */}
                    <button type='button' className={isShuffling ? styles.isActive : ''} disabled={!episode || episodeList.length === 1} onClick={toggleShuffle}>
                        <img src="/shuffle.svg" alt="Embaralhar"/>
                    </button>

                    <button type='button' disabled={!episode || !hasPrevious} onClick={playPrevious}>
                        <img src="/play-previous.svg" alt="Tocar anterior"/>
                    </button>

                    <button type='button' className={styles.playButton} onClick={togglePlay} disabled={!episode}>
                        {
                            isPlaying ? (
                                <img src="/pause.svg" alt="Tocar"/>
                            ) : (
                                <img src="/play.svg" alt="Tocar"/>
                            )
                        }
                    </button>

                    <button type='button' disabled={!episode || !hasNext} onClick={playNext}>
                        <img src="/play-next.svg" alt="Tocar próxima"/>
                    </button>

                    <button type='button' className={isLooping ? styles.isActive : ''} disabled={!episode} onClick={toggleLoop}>
                        <img src="/repeat.svg" alt="Repetir"/>
                    </button>
                </div>
            </footer>
        </div>
    );
}