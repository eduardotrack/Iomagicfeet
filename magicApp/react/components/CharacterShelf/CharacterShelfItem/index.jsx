import React from 'react';
import style from './styles.css';


const CharacterShelfItemComponent = ({
  character,
  index,
  openIndex,
  setOpenIndex,
}) => {
  return (
    <div
      key={index}
      className={`${style.characterShelfItem} ${
        openIndex === index ? style.characterShelfItemOpen : ''
      }`}
      style={{ backgroundColor: character.color }}
      onClick={() => setOpenIndex(index)}
    >
      <img src={character.image} alt={character.name} loading="lazy" />
      <div className={style.characterShelfInfo}>
        <p>{character.name}</p>
        <a href={character.link}>compre agora!</a>
      </div>
    </div>
  );
};

const CharacterShelfItem = React.memo(CharacterShelfItemComponent)

export default CharacterShelfItem;
