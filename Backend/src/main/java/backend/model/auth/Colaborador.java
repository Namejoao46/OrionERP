package backend.model.auth;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import backend.model.gestao.Empresa;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "COLABORADORES")
public class Colaborador implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String login;

    @Column(nullable = false)
    private String senha;

    private String nome;
    private String sobrenome;
    private LocalDate dataNascimento;
    private String cpf;
    private String matricula;
    private String cargo;
    private String endereco;
    private String tipoColaborador;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    @ManyToOne
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;

    @Lob
    // Garantindo compatibilidade com o Firebird para salvar os bytes da foto
    @Column(name = "foto", columnDefinition = "BLOB")
    private byte[] foto;

    // Métodos do UserDetails
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Se a role for nula, define um acesso básico padrão
        if (this.role == null) return List.of(new SimpleGrantedAuthority("ROLE_USER"));
        
        // Dinamicamente vira ROLE_MASTER, ROLE_COLABORADOR ou ROLE_ADMIN_DEV
        return List.of(
            new SimpleGrantedAuthority("ROLE_" + this.role.name()), 
            new SimpleGrantedAuthority("ROLE_USER")
        );
    }

    @Override public String getPassword() { return this.senha; }
    @Override public String getUsername() { return this.login; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}