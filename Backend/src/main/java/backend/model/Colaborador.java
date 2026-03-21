package backend.model;
import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

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

    @Lob
    private byte[] foto;

    public Colaborador() {}

    public void setId(Long id) { this.id = id; }
    public void setLogin(String login) { this.login = login; }
    public void setSenha(String senha) { this.senha = senha; }
    public void setNome(String nome) { this.nome = nome; }
    public void setSobrenome(String sobrenome) { this.sobrenome = sobrenome; }
    public void setDataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; }
    public void setCpf(String cpf) { this.cpf = cpf; }
    public void setMatricula(String matricula) { this.matricula = matricula; }
    public void setCargo(String cargo) { this.cargo = cargo; }
    public void setEndereco(String endereco) { this.endereco = endereco; }
    public void setTipoColaborador(String tipoColaborador) { this.tipoColaborador = tipoColaborador; }
    public void setFoto(byte[] foto) { this.foto = foto; }

    public Long getId() { return id; }
    public String getLogin() { return login; }
    public String getNome() { return nome; }
    public String getCargo() { return cargo; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getPassword() { return senha; }

    @Override
    public String getUsername() { return login; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
} 