import { Pipe, PipeTransform } from '@angular/core';
import {Logbooks} from '@model/logbooks';

@Pipe({
  name: 'logbookSearch'
})
export class LogbookSearchPipe implements PipeTransform {

  transform(logbooks: Logbooks[], searchString: string): any {
    if (searchString.length == 0){
      return logbooks;
    }
    if ((typeof logbooks != 'undefined') || (searchString.length > 0)){    
      return logbooks.filter((logbook:Logbooks) => {
        let searchMatch = false;
        for (const key in logbook) {
          if (Object.prototype.hasOwnProperty.call(logbook, key)) {
            const element = logbook[key];
            if (typeof element == "string"){
              if (searchMatch = element.toLowerCase().includes(searchString.toLowerCase())){
                break;
              }
            }
          }
        }
        return searchMatch;
      });
    }
    return null
  }

}
