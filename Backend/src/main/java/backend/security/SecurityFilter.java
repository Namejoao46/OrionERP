package backend.security;

import java.io.IOException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import backend.repository.ColaboradorRepository;
import backend.service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class SecurityFilter extends OncePerRequestFilter {

    @Autowired
    private TokenService tokenService;

    @Autowired
    private ColaboradorRepository repository;

    @Override
    protected void doFilterInternal(
        @NonNull HttpServletRequest request, 
        @NonNull HttpServletResponse response, 
        @NonNull FilterChain filterChain) throws ServletException, IOException {
        
        String uri = request.getRequestURI();

        if (uri.equals("/api/auth/login") || uri.startsWith("/ws")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        var tokenJWT = recuperarToken(request);

        if (tokenJWT != null) {
            try {
                var subject = tokenService.getSubject(tokenJWT);
                // CORREÇÃO: Extraindo o colaborador do Optional
                var colaborador = repository.findByLogin(subject).orElse(null);

                if (colaborador != null) {
                    System.out.println(">>> [SecurityFilter] Usuário autenticado: " + colaborador.getLogin());

                    // CORREÇÃO: Usando o objeto direto para pegar as autoridades
                    var authentication = new UsernamePasswordAuthenticationToken(
                        colaborador, 
                        null, 
                        colaborador.getAuthorities()
                    );
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception e) {
                System.out.println(">>> [SecurityFilter] Erro na validação do token: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }

    private String recuperarToken(HttpServletRequest request) {
        var authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.replace("Bearer ", "");
        }
        return null;
    }
}