package backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import backend.model.Colaborador;
import backend.model.UserRole;
import backend.repository.ColaboradorRepository;

@Service
public class GestaoService {

    @Autowired
    private ColaboradorRepository repository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Colaborador cadastrarNovoFuncionario(Colaborador novo, Colaborador adminLogado) {
        novo.setEmpresa(adminLogado.getEmpresa());
        novo.setRole(UserRole.COLABORADOR);
        novo.setSenha(passwordEncoder.encode(novo.getSenha()));
        
        return repository.save(novo);
    }
}