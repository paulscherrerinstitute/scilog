import { HttpClient, HttpHandler, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, Injector } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CK5ImageUploadAdapter {

  loader: any;  // your adapter communicates to CKEditor through this
  url: string;
  imageToShow: string | ArrayBuffer;


  // serverSettings = new ServerSettingsService;

  constructor(loader, private http: HttpClient) {
    this.loader = loader;
    // this.url = this.serverSettings.getServerAddress()+"files/";
    console.log('Upload Adapter Constructor', this.loader, this.url);
   
  }

  upload() {
    return this.loader.file
      .then((data: File) => new Promise((resolve, reject) => {
        console.log(data);
        this.createImageFromBlob(data).then(result => {
          console.log(result);
          let resolveVal = {
            default: result
          };
          console.log(JSON.stringify(resolveVal));
          resolve(resolveVal)
        })
      }
      ));
  }

  // uploadFile(file: File, url?: string) {
  //   console.log(file);
  //   const idToken = localStorage.getItem("id_token");


  //   const headersFile = new HttpHeaders().append('accept', 'application/json');
  //   headersFile.append("Content-Type", "multipart/form-data");
  //   headersFile.append("Authorization", "Bearer " + idToken);

  //   let formData = new FormData();
  //   formData.append('file', file);
  //   console.log(formData.getAll('file'));
  //   console.log(this.serverSettings.getServerAddress() + "files")
  //   console.log('formData', formData);
  //   return this.http.post(this.serverSettings.getServerAddress() + "files", formData, { headers: headersFile });
  // }

  abort() {
    console.log('UploadAdapter abort');
  }

  createImageFromBlob(image: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event: ProgressEvent<FileReader>) => {
        const result = event.target?.result;

        if (!result) {
          console.error("FileReader result is empty");
          reject("FileReader failed");
          return;
        }

        console.log("Reader loaded successfully");

        const img = new Image();

        
        img.onload = () => {
          console.log("Image loaded successfully");

          
          console.log("Original Width:", img.width);
          console.log("Original Height:", img.height);
          console.log("Original Size (KB):", (image.size / 1024).toFixed(2));

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            console.error("Canvas context not available");
            reject("Canvas error");
            return;
          }

          
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;

          let width = img.width;
          let height = img.height;

          
          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            if (width > height) {
              height = Math.round(height * (MAX_WIDTH / width));
              width = MAX_WIDTH;
            } else {
              width = Math.round(width * (MAX_HEIGHT / height));
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          ctx.drawImage(img, 0, 0, width, height);

          
          const quality = 0.7;
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);

          
          const newSizeKB = Math.round((compressedBase64.length * 3) / 4 / 1024);

          console.log("Compressed Width:", width);
          console.log("Compressed Height:", height);
          console.log("Compressed Size (KB):", newSizeKB);

          resolve(compressedBase64);
        };

        
        img.onerror = (err) => {
          console.error("Image failed to load", err);
          reject("Image load error");
        };

        
        img.src = result as string;
      };

      
      reader.onerror = (err) => {
        console.error("FileReader error", err);
        reject("FileReader error");
      };

      reader.readAsDataURL(image);
    });
  }

}




// export class CK5ImageUploadAdapterPlugin {
//   constructor(editor, private httpClient: HttpClient) {
//     console.log('CK5ImageUploadAdapterPlugin called');
//     editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
//       return new CK5ImageUploadAdapter(loader, this.httpClient);
//     };
//   }
// }


