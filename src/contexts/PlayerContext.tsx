import { createContext, ReactNode, useContext, useState } from 'react';

type Episode = {
    title: string;
    members: string;
    thumbnail: string;
    duration: number;
    url: string;
}

interface PlayerContextData {
    episodeList: Episode[];
    currentEpisodeIndex: number;
    isPlaying: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
    isLooping: boolean;
    isShuffling: boolean;
    play: (episode: Episode) => void;
    playList: (list: Episode[], index: number) => void;
    togglePlay: () => void;
    setPlayingState: (state: boolean) => void;
    playNext: () => void;
    playPrevious: () => void;
    toggleLoop: () => void;
    toggleShuffle: () => void;
    clearPlayerState: () => void;
}

interface PlayerContextProviderProps {
    children: ReactNode
}

// export const PlayerContext = createContext(''); // O valor do contexto '' vazio serve para indicar que o tipo será uma string
// export const PlayerContext = createContext({
//     episodeList: [],
//     currentEpisodeIndex: 0
// }); 

export const PlayerContext = createContext({} as PlayerContextData); 

export function PlayerContextProvider({ children }: PlayerContextProviderProps) {
    const [episodeList, setEpisodeList] = useState([]);
    const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLooping, setIsLooping] = useState(false);
    const [isShuffling, setIsShuffling] = useState(false);

    function play(episode: Episode) {
        setEpisodeList([episode]);
        setCurrentEpisodeIndex(0);
        setIsPlaying(true);
    }

    function playList(list: Episode[], index: number) {
        setEpisodeList(list);
        setCurrentEpisodeIndex(index);
        setIsPlaying(true);
    }

    function togglePlay() {
        setIsPlaying(!isPlaying);
    }

    function toggleLoop() {
        setIsLooping(!isLooping);
    }
    
    function toggleShuffle() {
        setIsShuffling(!isShuffling);
    }

    function setPlayingState(state: boolean) {
        setIsPlaying(state);
    }

    const hasPrevious = currentEpisodeIndex > 0;
    const hasNext = isShuffling || (currentEpisodeIndex + 1) < episodeList.length;

    function playNext() {
        // const nextEpisodeIndex = currentEpisodeIndex + 1;
        if (isShuffling) {
            const nextRandomEpisodeIndex = Math.floor(Math.random() * episodeList.length); // Números aleatórios de 0 até o tamanho do array de episódios

            setCurrentEpisodeIndex(nextRandomEpisodeIndex);
        } else if (hasNext) {
            setCurrentEpisodeIndex(currentEpisodeIndex + 1);
            // setCurrentEpisodeIndex(nextEpisodeIndex);
        }
    }

    function playPrevious() {
        // const previousEpisodeIndex = currentEpisodeIndex - 1;

        if (hasPrevious) {
            setCurrentEpisodeIndex(currentEpisodeIndex - 1);
            // setCurrentEpisodeIndex(previousEpisodeIndex);
        }
    }

    function clearPlayerState() {
        setEpisodeList([]);
        setCurrentEpisodeIndex(0);
    }

    return (
        <PlayerContext.Provider value={{ 
                episodeList, 
                currentEpisodeIndex, 
                hasNext,
                hasPrevious,
                isLooping,
                play, 
                playList,
                isPlaying, 
                togglePlay, 
                setPlayingState,
                playNext,
                playPrevious,
                toggleLoop,
                toggleShuffle,
                isShuffling,
                clearPlayerState
            }}>
            {children}
        </PlayerContext.Provider>
    );
}

export const usePlayer = () => {
    return useContext(PlayerContext);
}





