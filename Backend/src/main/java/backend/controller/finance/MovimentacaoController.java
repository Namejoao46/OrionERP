package backend.controller.finance;

import backend.dto.finance.DashboardFinanceDTO;
import backend.dto.finance.DashboardGastosDTO;
import backend.dto.finance.EvolucaoComprasDTO;
import backend.dto.finance.StatusCompraDTO;
import backend.model.finance.Movimentacao;
import backend.service.finance.MovimentacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movimentacoes")
@CrossOrigin("*")
@RequiredArgsConstructor
public class MovimentacaoController {

    private final MovimentacaoService service;

    @GetMapping
    public List<Movimentacao> listarTodas() {
        return service.listarTodas();
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardFinanceDTO> obterDashboard() {
        return ResponseEntity.ok(service.obterDadosDashboard());
    }

    @GetMapping("/dashboard-gastos")
    public ResponseEntity<DashboardGastosDTO> obterDashboardGastos() {
        return ResponseEntity.ok(service.obterDadosDashboardGastos());
    }

    // 🔥 Adicionado: Endpoint para alimentar o gráfico do ApexCharts
    @GetMapping("/evolucao-compras")
    public ResponseEntity<List<EvolucaoComprasDTO>> obterEvolucaoCompras() {
        return ResponseEntity.ok(service.obterEvolucaoCompras());
    }

    @PostMapping
    public ResponseEntity<Movimentacao> criarManualmente(@RequestBody Movimentacao movimentacao) {
        return ResponseEntity.ok(service.registrar(movimentacao));
    }

    @GetMapping("/compras-status")
    public ResponseEntity<List<StatusCompraDTO>> obterStatusCompras() {
        return ResponseEntity.ok(service.obterStatusCompras());
    }
}