import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { environment } from 'src/environments/environment';
import type { GiphyResponse } from '../interfaces/giphy.interfaces';
import { Gif } from '../interfaces/gif.interface';
import { GifMapper } from '../mapper/gif.mapper';
import { map, tap } from 'rxjs';

const loadFromLocalStorage = () => {
  const gifsFromLocalstorage = localStorage.getItem('historyData') ?? '{}';
  const gifs = JSON.parse(gifsFromLocalstorage);
  return gifs;
}

@Injectable({providedIn: 'root'})
export class GifService {

  private http = inject(HttpClient);

  trendingGifs = signal<Gif[]>([]);
  trendingGifsLoading = signal(true);

  searchHistory = signal<Record<string, Gif[]>>(loadFromLocalStorage());
  searchHistoryKeys = computed(() => Object.keys(this.searchHistory()));

  saveToLocalStorage = effect(() => {
    const history = JSON.stringify(this.searchHistory());
    localStorage.setItem(`historyData`, history);

    console.log(`Historial de búsquedas: ${Object.keys(history).length} entradas`);

  });

  constructor() {
    this.loadTrendingGifs();
  }

  loadTrendingGifs (){
    this.http.get<GiphyResponse>(`${environment.giphyUrl }/gifs/trending`,{
      params: {
        api_key: environment.giphyApiKey,
        limit: 20,
      },
    }).subscribe((resp) => {
        const gifs = GifMapper.mapGiphyItemsToGifArray(resp.data);
        this.trendingGifs.set(gifs);
        this.trendingGifsLoading.set(false);
        console.log({gifs})

    });
  }

  searchGifs(query: string){
    return this.http.get<GiphyResponse>(`${environment.giphyUrl}/gifs/search`,{
      params: {
        api_key: environment.giphyApiKey,
        limit:20,
        q: query,
      },
    })
    .pipe(
      map(({data}) => data),
      map((items) => GifMapper.mapGiphyItemsToGifArray(items)),

    //HISTORIAL
    tap((items) => {
      this.searchHistory.update((history) => ({
        ...history,
        [query.toLowerCase()]: items,
      }));
    })
  );


  }

  getHistoryGifs (query: string) {
    return this.searchHistory()[query] ?? [];
  }

}
