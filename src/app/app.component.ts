import { Component } from '@angular/core';
import { BotoesService } from '../app/services/botoes.service';
import { PlcService } from './services/plc.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'sistema-de-visao-casquilho';
  plcValue: Number | null = null;
  constructor(private plcService: PlcService) {}

  sendToPlc(value: number): void {
    console.log(`Número ${value} enviado ao PLC`);
    this.plcService.sendNumber(value).subscribe(() => {
      this.readFromPlc();
    });
  }

  // Ler o número atual do PLC
  readFromPlc(): void {
    this.plcService.readNumber().subscribe((data) => {
      this.plcValue = data.value;
      console.log('Número recebido do PLC:', this.plcValue);
    });
  }
}
