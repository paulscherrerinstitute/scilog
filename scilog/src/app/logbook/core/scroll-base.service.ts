import { Injectable } from '@angular/core';
import { IDatasource, Datasource } from 'ngx-ui-scroll';
import { WidgetItemConfig } from '@model/config';

@Injectable()
export class ScrollBaseService {

  datasource: IDatasource = null;
  startIndex = 0;
  config: WidgetItemConfig = null;

  constructor() { }

  public async initialize(config: WidgetItemConfig){
    // console.log("Config: ", this.config);
    this.config = config;
    this.setupDatasource();
    await this.datasource.adapter.reload();
    await this.setupStart();
    this.setupDatasource();
    await this.datasource.adapter.reload();

    // this.datasource.adapter.loopPending$.subscribe((val)=>{
    //   console.log("viewport is loading:")
    //   console.log(val);
    // })
  }

  protected setupDatasource(){
    if (this.datasource != null){
        this.datasource.adapter.reset(new Datasource({
          get: async (index: number, count: number) => {
            return this.getDataBuffer(index, count, this.config);
          },
    
          settings: {
            minIndex: 0,
            startIndex: this.startIndex,
            bufferSize: 50,
            padding: 1.5,
          }
        }));
    } else {
    this.datasource = new Datasource({
      get: async (index: number, count: number) => {
        return this.getDataBuffer(index, count, this.config);
      },

      settings: {
        minIndex: 0,
        startIndex: this.startIndex,
        bufferSize: 50,
        padding: 1.5,
      }
    });
  }
  }

  async setupStart(){
    this.startIndex = 0;
  }

  getDataBuffer(index:number, count:number, config:any){
    throw new Error("Abstract method needs to be implemented in derived class.")
  }

  async updateViewportEstimate(){
    await this.datasource.adapter.relax();
    this.datasource.adapter.check();
  }

  remove(id:string){
    this.datasource.adapter.remove({ predicate: ({ data }) => data.id === id });
  }

  reset(){
    if (this.datasource != null){
      this.datasource.adapter.reset();
    }
  }

  async appendToEOF(content:any){
    let resArray: any = [];
    resArray.push(content);
    await this.datasource.adapter.relax();
    await this.datasource.adapter.append({ items: resArray, eof: true });
  }

  async prependToBOF(content:any){
    let resArray: any = [];
    resArray.push(content);
    console.log(resArray);
    await this.datasource.adapter.prepend({ items: resArray, bof: true });
  }

  async relax(){
    await this.datasource.adapter.relax();
  }

  get isBOF(){
    return this.datasource.adapter.bof;
  }

  get isEOF(){
    return this.datasource.adapter.eof;
  }
  async goToSnippetIndex(index:number, _cb_after_relax:(...args:any[])=>void = ()=>{}){
    // jump to index in viewport, starting with index 0
    this.startIndex = index;
    this.setupDatasource();
    await this.datasource.adapter.reload();
    await this.datasource.adapter.relax();
    _cb_after_relax(this.startIndex+1, ...arguments);

  }

}
