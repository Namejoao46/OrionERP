package backend.service.auth;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import backend.repository.auth.ColaboradorRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AutenticacaoService implements UserDetailsService {

    private final ColaboradorRepository repository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println(">>> [AutenticacaoService] Carregando usuário: " + username);

        return repository.findByLogin(username)
            .orElseThrow(() -> {
                System.out.println(">>> [AutenticacaoService] Usuário não encontrado: " + username);
                return new UsernameNotFoundException("Usuário não encontrado: " + username);
            });
    }
}