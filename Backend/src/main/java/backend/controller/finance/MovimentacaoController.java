package backend.controller.finance;

import backend.dto.finance.DashboardFinanceDTO;
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

    @PostMapping
    public ResponseEntity<Movimentacao> criarManualmente(@RequestBody Movimentacao movimentacao) {
        return ResponseEntity.ok(service.registrar(movimentacao));
    }
}