import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { GifService } from '../../services/gifs.service';
import { GifListComponent } from "../../components/gif-list/gif-list.component";

@Component({
  selector: 'app-gif-history',
  templateUrl: './gif-history.component.html',
  imports: [GifListComponent],
})

export default class GifHistoryComponent {
[x: string]: any;

  GifService = inject(GifService)

  query = toSignal(
    inject(ActivatedRoute).params.pipe(
      map((params) => params['query']))
  );

  gifsByKey = computed(() => {
    return this.GifService.getHistoryGifs(this.query ())
  })

}
