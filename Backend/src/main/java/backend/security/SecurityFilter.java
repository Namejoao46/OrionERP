package backend.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import backend.model.Colaborador;
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
        
        // Pega a URI da requisição atual
        String uri = request.getRequestURI();

        // 1. REGRA DE EXCEÇÃO: Se for login ou WebSocket, deixa passar direto sem validar Token
        if (uri.equals("/api/auth/login") || uri.startsWith("/ws")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        var tokenJWT = recuperarToken(request);

        if (tokenJWT != null) {
            try {
                var subject = tokenService.getSubject(tokenJWT);
                var colaborador = repository.findByLogin(subject);

                if (colaborador != null) {
                    // Log para conferir no terminal se o usuário foi identificado
                    if (colaborador instanceof Colaborador colab) {
                        System.out.println(">>> [SecurityFilter] Usuário autenticado: " + colab.getLogin());
                    }

                    var authentication = new UsernamePasswordAuthenticationToken(colaborador, null, colaborador.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception e) {
                // Caso o token esteja expirado ou inválido, o erro é pego aqui
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