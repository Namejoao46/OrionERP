package backend.service;

import backend.repository.ColaboradorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AutenticacaoService implements UserDetailsService {

    @Autowired
    private ColaboradorRepository repository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println(">>> [AutenticacaoService] Carregando usuário: " + username);

        UserDetails user = repository.findByLogin(username);
        
        if (user == null) {
            System.out.println(">>> [AutenticacaoService] Usuário não encontrado: " + username);
            throw new UsernameNotFoundException("Usuário não encontrado: " + username);
        }
        
        System.out.println(">>> [AutenticacaoService] Usuário encontrado: " + username);
        return user;
    }
}