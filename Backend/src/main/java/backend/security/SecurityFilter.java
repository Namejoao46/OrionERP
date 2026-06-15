package backend.security;

import java.io.IOException;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import backend.repository.auth.ColaboradorRepository;
import backend.service.security.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SecurityFilter extends OncePerRequestFilter {

    // Modificadores 'final' adicionados e '@Autowired' removidos
    private final TokenService tokenService;
    private final ColaboradorRepository repository;

    @Override
    protected void doFilterInternal(
        @NonNull HttpServletRequest request, 
        @NonNull HttpServletResponse response, 
        @NonNull FilterChain filterChain) throws ServletException, IOException {
        
        String uri = request.getRequestURI();
        String método = request.getMethod();
        
        System.out.println(">>> [SecurityFilter] Interceptando Requisição HTTP: [" + método + "] " + uri);

        if (uri.equals("/api/auth/login") || uri.startsWith("/ws")) {
            System.out.println(">>> [SecurityFilter] Rota pública detectada (" + uri + "). Ignorando validação de token.");
            filterChain.doFilter(request, response);
            return;
        }
        
        var tokenJWT = recuperarToken(request);

        if (tokenJWT != null) {
            System.out.println(">>> [SecurityFilter] Token string extraído do Header com sucesso.");
            try {
                var subject = tokenService.getSubject(tokenJWT);
                System.out.println(">>> [SecurityFilter] Subject descompactado do JWT: \"" + subject + "\"");
                
                System.out.println(">>> [SecurityFilter] Buscando colaborador associado no banco...");
                var colaborador = repository.findByLogin(subject).orElse(null);

                if (colaborador != null) {
                    System.out.println(">>> [SecurityFilter] Usuário localizado: " + colaborador.getLogin() + " (ID: " + colaborador.getId() + ")");
                    System.out.println(">>> [SecurityFilter] Permissões vinculadas (Authorities): " + colaborador.getAuthorities());

                    var authentication = new UsernamePasswordAuthenticationToken(
                        colaborador, 
                        null, 
                        colaborador.getAuthorities()
                    );
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println(">>> [SecurityFilter] SecurityContextHolder alimentado! Usuário está oficialmente AUTENTICADO.");
                } else {
                    System.out.println(">>> [SecurityFilter] CRÍTICO: O subject do token \"" + subject + "\" não existe mais no Banco de Dados!");
                }
            } catch (Exception e) {
                System.err.println(">>> [SecurityFilter] FALHA CRÍTICA NO TOKEN: Token JWT inválido, adulterado ou expirado! Erro: " + e.getMessage());
            }
        } else {
            System.out.println(">>> [SecurityFilter] Alerta: Requisição para rota protegida SEM header Authorization/Bearer!");
        }

        System.out.println(">>> [SecurityFilter] Passando filtros adiante (chain.doFilter)...");
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