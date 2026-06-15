package backend.service.gestao;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import backend.model.auth.Colaborador;
import backend.model.auth.UserRole;
import backend.repository.auth.ColaboradorRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GestaoService {

    // Modificadores 'final' adicionados e '@Autowired' removidos
    private final ColaboradorRepository repository;
    private final PasswordEncoder passwordEncoder;

    public Colaborador cadastrarNovoFuncionario(Colaborador novo, Colaborador adminLogado) {
        novo.setEmpresa(adminLogado.getEmpresa());
        novo.setRole(UserRole.COLABORADOR);
        novo.setSenha(passwordEncoder.encode(novo.getSenha()));
        
        return repository.save(novo);
    }
}