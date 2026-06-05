package backend.service;

import backend.repository.ColaboradorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // 1. IMPORTANTE IMPORTAR ESTE

@Service
public class AutenticacaoService implements UserDetailsService {

    @Autowired
    private ColaboradorRepository repository;

    @Override
    @Transactional(readOnly = true) // 2. ADICIONE ESTA LINHA AQUI
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println(">>> [AutenticacaoService] Carregando usuário: " + username);

        return repository.findByLogin(username)
            .orElseThrow(() -> {
                System.out.println(">>> [AutenticacaoService] Usuário não encontrado: " + username);
                return new UsernameNotFoundException("Usuário não encontrado: " + username);
            });
    }
}