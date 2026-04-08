package backend.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import backend.model.Movimentacao;
import backend.repository.MovimentacaoRepository;

@RestController
@RequestMapping("/api/movimentacoes")
@CrossOrigin("*") 
public class MovimentacaoController {

    @Autowired
    private MovimentacaoRepository repository;

    @PostMapping("/entrada")
    public ResponseEntity<Movimentacao> registrarEntrada(@RequestBody Movimentacao data) {
        data.setTipo("ENTRADA");
        data.setDataHora(LocalDateTime.now()); 
        return ResponseEntity.ok(repository.save(data));
    }

    @GetMapping("/recentes")
    public List<Movimentacao> listarUltimas() {
        return repository.findAll(); 
}
}