package backend.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
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
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        
        System.out.println(">>> [SecurityFilter] Requisição recebida: " + request.getMethod() + " " + request.getRequestURI());

        if (request.getRequestURI().equals("/api/auth/login")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        var tokenJWT = recuperarToken(request);

        if (tokenJWT != null) {
             System.out.println(">>> [SecurityFilter] Token encontrado: " + tokenJWT);
            var subject = tokenService.getSubject(tokenJWT);
            var colaborador = repository.findByLogin(subject);

            if(colaborador != null) {
                if (colaborador instanceof Colaborador colab) {
                    System.out.println(">>> [SecurityFilter] Usuário autenticado: " + colab.getLogin());
                } else {
                    System.out.println(">>> [SecurityFilter] Usuário autenticado: " + colaborador.getUsername());
                }

                var authentication = new UsernamePasswordAuthenticationToken(colaborador, null, colaborador.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } else {
                System.out.println(">>> [SecurityFilter] Usuário não encontrado para subject: " + subject);
            }
        } else {
            System.out.println(">>> [SecurityFilter] Nenhum token presente na requisição.");
        }

        filterChain.doFilter(request, response);
    }

    private String recuperarToken(HttpServletRequest request) {
        var authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader != null) {
            return authorizationHeader.replace("Bearer ", "");
        }
        return null;
    }
}